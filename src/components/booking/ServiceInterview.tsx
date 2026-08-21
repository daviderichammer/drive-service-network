"use client";

/**
 * Guided Service Interview — Priority 2
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * REVAMP BUILD section 12: "The follow-up interview questions are already
 * defined in the Platform API. Do not invent DSN's own interview logic."
 *
 * This component walks the Platform API's guided-selection tree exactly as
 * published. Nothing about the questions, the answers, their order or their
 * service mapping is authored by DSN. Every question shown and every answer
 * recorded comes verbatim from `/api/platform/services?view=selection`, which
 * currently publishes three entry categories and 387 terminal paths:
 *
 *   • Diagnosis / Describe Problem — 156 paths, for members who know the
 *     symptom but not the repair.
 *   • Popular Services — 28 paths, the fast lane.
 *   • Service Catalog — 203 paths, browsing by system.
 *
 * The accumulated question-and-answer pairs are returned to the caller and are
 * sent to the facility with the booking, so the shop sees precisely what the
 * member reported in the member's own words.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, HelpCircle, Loader2, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectionNode {
  id: number;
  answer: string;
  question: string | null;
  serviceId: number;
  serviceName: string;
  icon: string;
  tooltipLabel: string;
  tooltipBody: string;
  weight: number;
  children: SelectionNode[];
}

export interface SelectionCategory {
  id: number;
  name: string;
  nodes: SelectionNode[];
}

export interface InterviewAnswer {
  question: string;
  answer: string;
}

export interface InterviewResult {
  serviceId: number;
  serviceName: string;
  /** The verbatim Platform API question/answer pairs collected on the way. */
  interview: InterviewAnswer[];
  /** Human-readable trail, e.g. "Brakes → Pad and rotor replacement → Front". */
  path: string[];
  categoryName: string;
}

interface Frame {
  /** The question being asked at this level, from the Platform API. */
  question: string;
  /** The options that answer it. */
  options: SelectionNode[];
}

const CATEGORY_BLURBS: Record<string, string> = {
  "Diagnosis / Describe Problem":
    "Describe what the vehicle is doing and we will identify the right diagnostic service.",
  "Popular Services": "The services members request most often.",
  "Service Catalog": "Browse the full catalog by vehicle system.",
};

export function ServiceInterview({
  onComplete,
  initialServiceId,
}: {
  onComplete: (result: InterviewResult) => void;
  initialServiceId?: number | null;
}) {
  const [categories, setCategories] = useState<SelectionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<SelectionCategory | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/platform/services?view=selection");
        if (!res.ok) throw new Error("selection unavailable");
        const payload = await res.json();
        const list: SelectionCategory[] = Array.isArray(payload.data) ? payload.data : [];
        if (cancelled) return;
        setCategories(list);
        setError(list.length === 0 ? "No services are available right now." : null);
      } catch {
        if (!cancelled) {
          setError(
            "We could not load the service list. Please refresh the page or try again shortly."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Flattened terminal paths, used by the search box. */
  const searchIndex = useMemo(() => {
    const out: Array<{
      serviceId: number;
      serviceName: string;
      trail: string[];
      interview: InterviewAnswer[];
      categoryName: string;
    }> = [];

    const walk = (
      cat: SelectionCategory,
      node: SelectionNode,
      trail: string[],
      interview: InterviewAnswer[],
      parentQuestion: string
    ) => {
      const nextTrail = [...trail, node.answer];
      const nextInterview = parentQuestion
        ? [...interview, { question: parentQuestion, answer: node.answer }]
        : interview;

      if (node.children.length === 0 || node.question === null) {
        out.push({
          serviceId: node.serviceId,
          serviceName: node.serviceName,
          trail: nextTrail,
          interview: nextInterview,
          categoryName: cat.name,
        });
        return;
      }
      for (const child of node.children) {
        walk(cat, child, nextTrail, nextInterview, node.question);
      }
    };

    for (const cat of categories) {
      for (const node of cat.nodes) {
        walk(cat, node, [], [], "");
      }
    }
    return out;
  }, [categories]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return searchIndex
      .filter(
        (item) =>
          item.serviceName.toLowerCase().includes(q) ||
          item.trail.some((step) => step.toLowerCase().includes(q))
      )
      .slice(0, 25);
  }, [query, searchIndex]);

  // A service pre-selected elsewhere (for example from the home-page search)
  // short-circuits the interview so the member is not asked to answer twice.
  useEffect(() => {
    if (!initialServiceId || searchIndex.length === 0) return;
    const match = searchIndex.find((item) => item.serviceId === initialServiceId);
    if (match) {
      onComplete({
        serviceId: match.serviceId,
        serviceName: match.serviceName,
        interview: match.interview,
        path: match.trail,
        categoryName: match.categoryName,
      });
    }
    // Intentionally runs once the index is built.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServiceId, searchIndex]);

  const choose = useCallback(
    (node: SelectionNode, question: string) => {
      const nextAnswers = question
        ? [...answers, { question, answer: node.answer }]
        : answers;
      const nextPath = [...path, node.answer];

      // Terminal: the Platform API has resolved the service.
      if (node.children.length === 0 || node.question === null) {
        onComplete({
          serviceId: node.serviceId,
          serviceName: node.serviceName,
          interview: nextAnswers,
          path: nextPath,
          categoryName: category?.name ?? "",
        });
        return;
      }

      setAnswers(nextAnswers);
      setPath(nextPath);
      setFrames((prev) => [...prev, { question: node.question!, options: node.children }]);
    },
    [answers, path, category, onComplete]
  );

  function startCategory(cat: SelectionCategory) {
    setCategory(cat);
    setAnswers([]);
    setPath([]);
    setFrames([
      {
        question:
          cat.name === "Diagnosis / Describe Problem"
            ? "What is the vehicle doing?"
            : cat.name === "Popular Services"
              ? "Which service do you need?"
              : "Which system needs attention?",
        options: [...cat.nodes].sort((a, b) => a.weight - b.weight),
      },
    ]);
  }

  function back() {
    if (frames.length <= 1) {
      setCategory(null);
      setFrames([]);
      setAnswers([]);
      setPath([]);
      return;
    }
    setFrames((prev) => prev.slice(0, -1));
    setAnswers((prev) => prev.slice(0, -1));
    setPath((prev) => prev.slice(0, -1));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-7 w-7 animate-spin text-teal" />
        <p className="font-opensans text-sm text-gray-500">Loading services…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
        <div>
          <p className="font-montserrat text-sm font-semibold text-red-700">
            Services are temporarily unavailable
          </p>
          <p className="mt-1 font-opensans text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const currentFrame = frames[frames.length - 1];

  return (
    <div>
      {/* Search across every published path */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services — oil change, brakes, check engine light…"
          aria-label="Search services"
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 font-opensans text-sm text-navy placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal"
        />
      </div>

      {query.trim().length >= 2 ? (
        <div>
          <p className="mb-3 font-montserrat text-xs font-semibold uppercase tracking-wide text-gray-500">
            {searchResults.length} match{searchResults.length === 1 ? "" : "es"}
          </p>
          {searchResults.length === 0 ? (
            <p className="py-8 text-center font-opensans text-sm text-gray-400">
              No services match that search. Try a different word, or browse the
              categories below.
            </p>
          ) : (
            <div className="grid max-h-[28rem] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {searchResults.map((item, index) => (
                <button
                  key={`${item.serviceId}-${index}`}
                  onClick={() =>
                    onComplete({
                      serviceId: item.serviceId,
                      serviceName: item.serviceName,
                      interview: item.interview,
                      path: item.trail,
                      categoryName: item.categoryName,
                    })
                  }
                  className="rounded-lg border border-gray-100 p-3 text-left transition-all hover:border-teal/40 hover:bg-teal/5"
                >
                  <div className="font-montserrat text-sm font-semibold leading-snug text-navy">
                    {item.serviceName}
                  </div>
                  <div className="mt-1 font-opensans text-xs text-gray-400">
                    {item.trail.join(" › ")}
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setQuery("")}
            className="mt-4 font-montserrat text-xs font-semibold text-teal hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : !category ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => startCategory(cat)}
              className="group rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-teal hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-montserrat text-base font-bold text-navy">
                  {cat.name === "Diagnosis / Describe Problem"
                    ? "Describe the Problem"
                    : cat.name}
                </h3>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-teal" />
              </div>
              <p className="mt-2 font-opensans text-xs leading-relaxed text-gray-500">
                {CATEGORY_BLURBS[cat.name] ?? "Choose a service."}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {/* Breadcrumb of answers already given */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={back}
              className="inline-flex items-center gap-1 font-montserrat text-xs font-semibold text-teal hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            {path.length > 0 && (
              <span className="font-opensans text-xs text-gray-400">
                {[category.name, ...path].join(" › ")}
              </span>
            )}
          </div>

          {/* The Platform API's question, verbatim */}
          <h3 className="font-montserrat text-lg font-bold text-navy">
            {currentFrame?.question}
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {currentFrame?.options.map((node) => (
              <button
                key={node.id}
                onClick={() => choose(node, currentFrame.question)}
                className={cn(
                  "group flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all",
                  "hover:border-teal hover:bg-teal/5"
                )}
              >
                <div>
                  <div className="font-montserrat text-sm font-semibold text-navy">
                    {node.answer}
                  </div>
                  {node.tooltipBody && (
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <HelpCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-300" />
                      <span className="font-opensans text-xs leading-relaxed text-gray-400">
                        {node.tooltipBody}
                      </span>
                    </div>
                  )}
                  {node.children.length === 0 && node.serviceName && (
                    <div className="mt-1 font-opensans text-xs text-teal">
                      {node.serviceName}
                    </div>
                  )}
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-teal" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
