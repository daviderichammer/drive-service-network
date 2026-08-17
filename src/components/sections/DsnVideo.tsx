"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { DSN_VIDEO_ID } from "@/lib/content";

interface DsnVideoProps {
  className?: string;
  title?: string;
}

/**
 * CHANGE 012 — embedded Drive Service Network video.
 *
 * The video plays inside www.driveservicenetwork.com. A click-to-load
 * thumbnail keeps the page light on mobile (012-E) and the privacy-enhanced
 * player with related videos restricted to this channel minimizes YouTube
 * distractions that would send the visitor away from DSN (012-C).
 */
export function DsnVideo({ className, title = "Drive Service Network" }: DsnVideoProps) {
  const [playing, setPlaying] = useState(false);

  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${DSN_VIDEO_ID}` +
    "?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3";

  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full overflow-hidden rounded-2xl bg-navy-900 shadow-2xl ring-1 ring-white/15 aspect-video">
        {playing ? (
          <iframe
            src={embedSrc}
            title={`${title} video`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label="Play the Drive Service Network video"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${DSN_VIDEO_ID}/maxresdefault.jpg`}
              alt="Drive Service Network video"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-navy/40 transition-colors duration-200 group-hover:bg-navy/25" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold shadow-lg transition-transform duration-200 group-hover:scale-110 md:h-20 md:w-20">
                <Play className="ml-1 h-7 w-7 text-navy md:h-9 md:w-9" fill="#1B2B4D" />
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
