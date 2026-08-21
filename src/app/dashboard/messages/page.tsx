"use client";

/**
 * Facility messages — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * BUILD section 25. Conversations are operated by Drive Service Network and
 * relayed to the facility, because the Platform API offers no messaging surface
 * (FLAG F-7). The page says so honestly rather than implying a live chat.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info, Loader2, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ThreadSummary {
  id: string;
  subject: string;
  facilityName: string | null;
  status: string;
  lastMessageAt: string;
  unreadForMember: number;
  appointmentId: string | null;
  vehicle: { year: number; make: string; model: string; nickname: string | null } | null;
  messages: Array<{ body: string; direction: string; createdAt: string }>;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-teal/10 text-teal" },
  AWAITING_FACILITY: { label: "Sent to facility", className: "bg-blue-50 text-blue-700" },
  AWAITING_MEMBER: { label: "Reply needed", className: "bg-gold/20 text-gold-700" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-500" },
};

export default function MessagesPage() {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/messages");
        const payload = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(payload.error ?? "We could not load your messages.");
          return;
        }
        setThreads(Array.isArray(payload.threads) ? payload.threads : []);
      } catch {
        if (!cancelled) setError("We could not load your messages. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-navy">Messages</h1>
          <p className="mt-1 font-opensans text-sm text-gray-500">
            Your conversations with service facilities.
          </p>
        </div>
        <Button variant="primary" size="md" asChild>
          <Link href="/dashboard/appointments">
            <Plus className="mr-1.5 h-4 w-4" />
            Message a facility
          </Link>
        </Button>
      </div>

      {/* How messaging actually works — stated plainly. */}
      <div className="flex items-start gap-3 rounded-lg border border-navy/10 bg-navy/5 p-4">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy/50" />
        <p className="font-opensans text-xs leading-relaxed text-gray-600">
          Messages are handled by Drive Service Network and passed to the facility on
          your behalf, so your contact details stay with us. For anything urgent, call
          the facility directly using the number on your appointment.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-teal" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="font-opensans text-sm text-red-700">{error}</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-card">
          <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="font-montserrat text-sm font-semibold text-navy">
            No messages yet
          </p>
          <p className="mx-auto mt-1 max-w-sm font-opensans text-xs text-gray-400">
            Once you book a service you can message the facility from the appointment
            page — questions about drop-off, parts, timing, anything.
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/dashboard/appointments">View my appointments</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          <ul className="divide-y divide-gray-50">
            {threads.map((thread) => {
              const status = STATUS_LABELS[thread.status] ?? STATUS_LABELS.OPEN;
              const latest = thread.messages[0];
              return (
                <li key={thread.id}>
                  <Link
                    href={`/dashboard/messages/${thread.id}`}
                    className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-montserrat text-sm font-semibold text-navy">
                          {thread.subject}
                        </p>
                        {thread.unreadForMember > 0 && (
                          <span className="rounded-full bg-gold px-1.5 py-0.5 font-montserrat text-[10px] font-black text-navy">
                            {thread.unreadForMember} new
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 font-opensans text-xs text-gray-500">
                        {thread.facilityName ?? "Drive Service Network"}
                        {thread.vehicle &&
                          ` · ${thread.vehicle.year} ${thread.vehicle.make} ${thread.vehicle.model}`}
                      </p>
                      {latest && (
                        <p className="mt-1 line-clamp-1 font-opensans text-xs text-gray-400">
                          {latest.direction === "MEMBER_TO_FACILITY" ? "You: " : ""}
                          {latest.body}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide",
                          status.className
                        )}
                      >
                        {status.label}
                      </span>
                      <p className="mt-1 font-opensans text-[11px] text-gray-400">
                        {new Date(thread.lastMessageAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
