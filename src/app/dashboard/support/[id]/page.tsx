"use client";

/**
 * One support request — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SupportMessage {
  id: string;
  fromMember: boolean;
  authorName: string | null;
  body: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string | null;
  status: string;
  priority: string;
  createdAt: string;
  messages: SupportMessage[];
}

export default function SupportTicketPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/${params.id}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not load this request.");
        return;
      }
      setTicket(payload.ticket);
    } catch {
      setError("We could not load this request.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not send your reply.");
        return;
      }
      setBody("");
      await load();
    } catch {
      setError("We could not send your reply. Please try again.");
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

  if (!ticket) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6">
        <p className="font-opensans text-sm text-red-700">
          {error ?? "Support request not found."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/support">Back to support</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/support"
        className="inline-flex items-center gap-1.5 font-montserrat text-xs font-semibold text-teal hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All support requests
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="border-b border-gray-100 px-5 py-4">
          <h1 className="font-montserrat text-base font-bold text-navy">
            {ticket.subject}
          </h1>
          <p className="mt-0.5 font-opensans text-xs text-gray-500">
            {ticket.category ?? "Support"} · opened{" "}
            {new Date(ticket.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-3 px-5 py-5">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.fromMember ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.fromMember
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
                    message.fromMember ? "text-white/50" : "text-gray-400"
                  )}
                >
                  {message.fromMember
                    ? "You"
                    : (message.authorName ?? "Drive Service Network")}{" "}
                  ·{" "}
                  {new Date(message.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {ticket.status !== "CLOSED" ? (
          <div className="border-t border-gray-100 px-5 py-4">
            {error && <p className="mb-2 font-opensans text-xs text-red-600">{error}</p>}
            <div className="flex items-end gap-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 4000))}
                rows={2}
                placeholder="Add to this request…"
                aria-label="Reply"
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
          </div>
        ) : (
          <div className="border-t border-gray-100 px-5 py-4 text-center font-opensans text-xs text-gray-400">
            This request has been closed. Open a new request if you need anything else.
          </div>
        )}
      </div>
    </div>
  );
}
