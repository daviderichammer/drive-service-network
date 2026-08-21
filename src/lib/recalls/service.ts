/**
 * Safety recalls — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * BUILD section 24 requires DSN to surface open safety recalls for a member's
 * vehicles. The Openbay Platform API publishes no recall data — the full
 * specification was audited and contains nothing of the kind — so Drive Service
 * Network sources recalls from the U.S. National Highway Traffic Safety
 * Administration, which is the authoritative public record for this country and
 * the same data every manufacturer lookup tool uses.
 *
 * Two deliberate choices:
 *
 *   1. Results are cached per vehicle. NHTSA is a free public service and
 *      hammering it on every dashboard render would be both slow for the member
 *      and discourteous to the source.
 *
 *   2. DSN never marks a recall as "completed". Only the member or the repairing
 *      facility can know that. The member can acknowledge a recall so it stops
 *      dominating the dashboard, and the record plainly says that acknowledging
 *      is not the same as having the work done.
 */
import "server-only";

import { prisma } from "@/lib/prisma";

const NHTSA_BASE = "https://api.nhtsa.gov";
/** Re-check a vehicle at most once a day. Recalls are not issued by the hour. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

interface NhtsaRecall {
  NHTSACampaignNumber?: string;
  Component?: string;
  Summary?: string;
  Consequence?: string;
  Remedy?: string;
  Manufacturer?: string;
  ReportReceivedDate?: string;
}

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // An outage at NHTSA must never break the member's dashboard.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * NHTSA reports recalls by make, model and year. VIN-level lookup exists but
 * covers only a subset of manufacturers, so the year/make/model campaign list
 * is the dependable path and is what the public "check for recalls" tools use.
 */
async function lookupRecalls(
  year: number,
  make: string,
  model: string
): Promise<NhtsaRecall[]> {
  const url =
    `${NHTSA_BASE}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}` +
    `&model=${encodeURIComponent(model)}&modelYear=${year}`;
  const payload = (await fetchJson(url)) as { results?: NhtsaRecall[] } | null;
  return Array.isArray(payload?.results) ? payload.results : [];
}

/**
 * NHTSA returns dates as DD/MM/YYYY, which `new Date()` misreads as US
 * MM/DD/YYYY and silently mangles — 28/05/2020 becomes Invalid Date while
 * 05/06/2020 becomes the wrong month entirely. Parse it explicitly.
 */
function parseDate(value?: string): Date | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export interface VehicleRecallRecord {
  id: string;
  campaignNumber: string;
  component: string | null;
  summary: string | null;
  consequence: string | null;
  remedy: string | null;
  manufacturer: string | null;
  reportReceivedDate: Date | null;
  acknowledgedAt: Date | null;
}

/**
 * Returns the open recalls for one vehicle, refreshing from NHTSA when the
 * cache has expired. Never throws: the dashboard degrades to "we could not
 * check right now" rather than failing.
 */
export async function getVehicleRecalls(
  vehicleId: string,
  options: { force?: boolean } = {}
): Promise<{ recalls: VehicleRecallRecord[]; checkedAt: Date | null; stale: boolean }> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, year: true, make: true, model: true },
  });
  if (!vehicle) return { recalls: [], checkedAt: null, stale: false };

  const existing = await prisma.vehicleRecall.findMany({
    where: { vehicleId },
    orderBy: { reportReceivedDate: "desc" },
  });

  const newestFetch = existing.reduce<Date | null>(
    (acc, row) => (!acc || row.fetchedAt > acc ? row.fetchedAt : acc),
    null
  );
  const fresh =
    newestFetch !== null && Date.now() - newestFetch.getTime() < CACHE_TTL_MS;

  if (fresh && !options.force) {
    return { recalls: existing, checkedAt: newestFetch, stale: false };
  }

  const upstream = await lookupRecalls(vehicle.year, vehicle.make, vehicle.model);

  if (upstream.length === 0 && existing.length > 0 && !options.force) {
    // Upstream returned nothing where we previously had data: more likely a
    // transient failure than every recall being withdrawn. Keep what we have
    // and report it as possibly stale rather than telling the member their
    // vehicle is clear.
    return { recalls: existing, checkedAt: newestFetch, stale: true };
  }

  const now = new Date();
  for (const recall of upstream) {
    const campaignNumber = recall.NHTSACampaignNumber?.trim();
    if (!campaignNumber) continue;
    await prisma.vehicleRecall.upsert({
      where: { vehicleId_campaignNumber: { vehicleId, campaignNumber } },
      create: {
        vehicleId,
        campaignNumber,
        component: recall.Component ?? null,
        summary: recall.Summary ?? null,
        consequence: recall.Consequence ?? null,
        remedy: recall.Remedy ?? null,
        manufacturer: recall.Manufacturer ?? null,
        reportReceivedDate: parseDate(recall.ReportReceivedDate),
        fetchedAt: now,
      },
      update: {
        component: recall.Component ?? null,
        summary: recall.Summary ?? null,
        consequence: recall.Consequence ?? null,
        remedy: recall.Remedy ?? null,
        manufacturer: recall.Manufacturer ?? null,
        reportReceivedDate: parseDate(recall.ReportReceivedDate),
        fetchedAt: now,
      },
    });
  }

  const refreshed = await prisma.vehicleRecall.findMany({
    where: { vehicleId },
    orderBy: { reportReceivedDate: "desc" },
  });

  return { recalls: refreshed, checkedAt: now, stale: false };
}

/** Recall counts across the member's fleet, for the dashboard summary. */
export async function getFleetRecallSummary(userId: string): Promise<{
  openCount: number;
  vehiclesAffected: number;
}> {
  const rows = await prisma.vehicleRecall.findMany({
    where: { vehicle: { userId, status: { not: "REMOVED" } }, acknowledgedAt: null },
    select: { vehicleId: true },
  });
  return {
    openCount: rows.length,
    vehiclesAffected: new Set(rows.map((r) => r.vehicleId)).size,
  };
}

export async function acknowledgeRecall(
  userId: string,
  recallId: string
): Promise<{ ok: boolean }> {
  const recall = await prisma.vehicleRecall.findFirst({
    where: { id: recallId, vehicle: { userId } },
    select: { id: true },
  });
  if (!recall) return { ok: false };
  await prisma.vehicleRecall.update({
    where: { id: recall.id },
    data: { acknowledgedAt: new Date() },
  });
  return { ok: true };
}
