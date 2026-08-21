"use client";

/**
 * One facility conversation — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ThreadMessage {
  id: string;
  direction: "MEMBER_TO_FACILITY" | "FACILITY_TO_MEMBER" | "DSN_TO_MEMBER";
  body: string;
  authorName: string | null;
  createdAt: string;
}

interface Thread {
  id: string;
  subject: string;
  facilityName: string | null;
  facilityPhone: string | null;
  status: string;
  appointmentId: string | null;
  vehicle: { id: string; year: number; make: string; model: string } | null;
  messages: ThreadMessage[];
}

export default function MessageThreadPage() {
  const params = useParams<{ id: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${params.id}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not load this conversation.");
        return;
      }
      setThread(payload.thread);
      setError(null);
    } catch {
      setError("We could not load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not send your message.");
        return;
      }
      setBody("");
      await load();
    } catch {
      setError("We could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-teal" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6">
        <p className="font-opensans text-sm text-red-700">
          {error ?? "Conversation not found."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/messages">Back to messages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/messages"
        className="inline-flex items-center gap-1.5 font-montserrat text-xs font-semibold text-teal hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All messages
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h1 className="font-montserrat text-base font-bold text-navy">
              {thread.subject}
            </h1>
            <p className="mt-0.5 font-opensans text-xs text-gray-500">
              {thread.facilityName ?? "Drive Service Network"}
              {thread.vehicle &&
                ` · ${thread.vehicle.year} ${thread.vehicle.make} ${thread.vehicle.model}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {thread.facilityPhone && (
              <a
                href={`tel:${thread.facilityPhone}`}
                className="inline-flex items-center gap-1.5 font-montserrat text-xs font-semibold text-teal hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                Call facility
              </a>
            )}
            {thread.appointmentId && (
              <Link
                href={`/dashboard/appointments/${thread.appointmentId}`}
                className="font-montserrat text-xs font-semibold text-teal hover:underline"
              >
                View appointment
              </Link>
            )}
          </div>
        </div>

        <div className="max-h-[26rem] space-y-3 overflow-y-auto px-5 py-5">
          {thread.messages.map((message) => {
            const fromMember = message.direction === "MEMBER_TO_FACILITY";
            return (
              <div
                key={message.id}
                className={cn("flex", fromMember ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    fromMember
                      ? "rounded-br-sm bg-navy text-white"
                      : "rounded-bl-sm bg-gray-100 text-navy"
                  )}
                >
                  <p className="whitespace-pre-wrap font-opensans text-sm leading-relaxed">
                    {message.body}
                  </p>
                  <p
                    className={cn(
                      "mt-1.5 font-opensans text-[11px]",
                      fromMember ? "text-white/50" : "text-gray-400"
                    )}
                  >
                    {message.authorName ? `${message.authorName} · ` : ""}
                    {new Date(message.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {thread.status !== "CLOSED" ? (
          <div className="border-t border-gray-100 px-5 py-4">
            {error && (
              <p className="mb-2 font-opensans text-xs text-red-600">{error}</p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 4000))}
                rows={2}
                placeholder="Write a message…"
                aria-label="Message"
                className="flex-1 resize-none rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <Button
                variant="primary"
                size="md"
                onClick={send}
                disabled={!body.trim() || sending}
                loading={sending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 font-opensans text-[11px] text-gray-400">
              Drive Service Network relays your message to the facility and records
              their reply here.
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-100 px-5 py-4 text-center font-opensans text-xs text-gray-400">
            This conversation has been closed.
          </div>
        )}
      </div>
    </div>
  );
}
