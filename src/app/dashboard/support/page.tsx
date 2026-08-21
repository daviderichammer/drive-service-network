"use client";

/**
 * Member support — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * BUILD section 26. Support belongs to Drive Service Network: a member with a
 * problem talks to DSN, never to Openbay, which is Absolute Rule 1 applied to
 * the least glamorous but most important surface in the product.
 *
 * Response expectations are stated rather than implied. A member who writes at
 * eleven at night should know when to expect an answer and how to reach someone
 * immediately if the matter cannot wait.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Loader2,
  LifeBuoy,
  Mail,
  MessageSquarePlus,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  category: string | null;
  status: string;
  priority: string;
  lastMessageAt: string;
  createdAt: string;
  messages: Array<{ body: string; fromMember: boolean; createdAt: string }>;
}

const CATEGORIES = [
  "Appointment or booking",
  "A facility or the work performed",
  "DSN+ discount program",
  "Billing",
  "My vehicles or account",
  "Something else",
];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-teal/10 text-teal" },
  IN_PROGRESS: { label: "In progress", className: "bg-blue-50 text-blue-700" },
  WAITING_ON_MEMBER: { label: "Needs your reply", className: "bg-gold/20 text-gold-700" },
  RESOLVED: { label: "Resolved", className: "bg-green-50 text-green-700" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-500" },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/support");
      const payload = await res.json();
      if (res.ok) setTickets(Array.isArray(payload.tickets) ? payload.tickets : []);
    } catch {
      // The compose form still works; the list simply stays empty.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    if (!subject.trim() || !body.trim()) {
      setError("Please give your request a subject and tell us what is happening.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), category }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not send your request.");
        return;
      }
      setSent(true);
      setComposing(false);
      setSubject("");
      setBody("");
      await load();
    } catch {
      setError("We could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-navy">Support</h1>
          <p className="mt-1 font-opensans text-sm text-gray-500">
            Talk to the Drive Service Network team.
          </p>
        </div>
        {!composing && (
          <Button variant="primary" size="md" onClick={() => setComposing(true)}>
            <MessageSquarePlus className="mr-1.5 h-4 w-4" />
            New request
          </Button>
        )}
      </div>

      {sent && (
        <div className="rounded-xl border border-teal/30 bg-teal/5 p-5">
          <p className="font-montserrat text-sm font-bold text-navy">
            Your request has been received
          </p>
          <p className="mt-1 font-opensans text-sm text-gray-600">
            A member of the Drive Service Network team will respond within one business
            day. You will see their reply here.
          </p>
        </div>
      )}

      {composing && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h2 className="font-montserrat text-base font-bold text-navy">
            How can we help?
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="support-category"
                className="font-montserrat text-xs font-semibold text-navy"
              >
                What is this about?
              </label>
              <select
                id="support-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal"
              >
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="support-subject"
                className="font-montserrat text-xs font-semibold text-navy"
              >
                Subject
              </label>
              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value.slice(0, 180))}
                placeholder="A short summary"
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>

            <div>
              <label
                htmlFor="support-body"
                className="font-montserrat text-xs font-semibold text-navy"
              >
                Tell us what is happening
              </label>
              <textarea
                id="support-body"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 4000))}
                placeholder="Include the vehicle and the facility if it helps."
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>

            {error && <p className="font-opensans text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={submit}
                disabled={submitting}
                loading={submitting}
              >
                Send request
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setComposing(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Direct contact, for anything that cannot wait for a ticket. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="tel:+18005550199"
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-card transition-colors hover:border-teal/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10">
            <Phone className="h-4 w-4 text-teal" />
          </div>
          <div>
            <p className="font-montserrat text-sm font-bold text-navy">Call us</p>
            <p className="font-opensans text-xs text-gray-500">
              Monday to Friday, 8am – 8pm ET
            </p>
          </div>
        </a>
        <Link
          href="/contact"
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-card transition-colors hover:border-teal/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">
            <Mail className="h-4 w-4 text-navy" />
          </div>
          <div>
            <p className="font-montserrat text-sm font-bold text-navy">Contact form</p>
            <p className="font-opensans text-xs text-gray-500">
              For general enquiries
            </p>
          </div>
        </Link>
      </div>

      {/* Existing requests */}
      <div>
        <h2 className="mb-3 font-montserrat text-sm font-bold text-navy">
          Your requests
        </h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-teal" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
            <LifeBuoy className="mx-auto mb-2 h-10 w-10 text-gray-200" />
            <p className="font-opensans text-sm text-gray-500">
              You have not opened any support requests.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
            <ul className="divide-y divide-gray-50">
              {tickets.map((ticket) => {
                const status = STATUS_LABELS[ticket.status] ?? STATUS_LABELS.OPEN;
                return (
                  <li key={ticket.id}>
                    <Link
                      href={`/dashboard/support/${ticket.id}`}
                      className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="font-montserrat text-sm font-semibold text-navy">
                          {ticket.subject}
                        </p>
                        <p className="mt-0.5 font-opensans text-xs text-gray-500">
                          {ticket.category ?? "Support"} ·{" "}
                          {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        {ticket.messages[0] && (
                          <p className="mt-1 line-clamp-1 font-opensans text-xs text-gray-400">
                            {ticket.messages[0].fromMember ? "You: " : "DSN: "}
                            {ticket.messages[0].body}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide",
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
