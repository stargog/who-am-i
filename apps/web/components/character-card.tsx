"use client";

import { useEffect, useState } from "react";
import type { ClientDeckInfo } from "@who-am-i/shared/deck";
import { formatTagLine } from "@who-am-i/shared/deck-utils";
import { deckImageSrc } from "@/lib/deck-client";
import { clsx } from "clsx";

const PLACEHOLDER = "/deck/placeholder.svg";

type Props = {
  deck: ClientDeckInfo | null;
  hidden?: boolean;
  variant?: "table" | "panel";
  className?: string;
};

function CardDetails({
  deck,
  hintCount,
  factCount,
  size,
}: {
  deck: ClientDeckInfo;
  hintCount: number;
  factCount: number;
  size: "table" | "panel";
}) {
  const isTable = size === "table";

  return (
    <div className="min-w-0 flex-1 text-left">
      <p
        className={clsx(
          "font-bold leading-tight text-[var(--accent)]",
          isTable ? "text-sm md:text-base lg:text-lg" : "text-base md:text-lg"
        )}
      >
        {deck.name}
      </p>
      <p
        className={clsx(
          "mt-0.5 leading-snug text-[var(--muted)]",
          isTable ? "text-xs md:text-sm" : "text-sm"
        )}
      >
        {formatTagLine(deck.tags)}
      </p>

      {deck.hints.length > 0 && (
        <div className="mt-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--muted)] md:text-xs">
            Hints
          </p>
          <ul
            className={clsx(
              "mt-0.5 list-inside list-disc space-y-0.5 text-[var(--text)]",
              isTable ? "text-xs md:text-sm" : "text-sm"
            )}
          >
            {deck.hints.slice(0, hintCount).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {factCount > 0 && deck.facts.length > 0 && (
        <div className="mt-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--muted)] md:text-xs">
            Facts
          </p>
          <ul
            className={clsx(
              "mt-0.5 list-inside list-disc space-y-0.5 text-[var(--text)]",
              isTable ? "text-xs md:text-sm" : "text-sm"
            )}
          >
            {deck.facts.slice(0, factCount).map((f) => (
              <li key={f} className="line-clamp-2">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CharacterCard({
  deck,
  hidden = false,
  variant = "panel",
  className,
}: Props) {
  const [src, setSrc] = useState(() => deckImageSrc(PLACEHOLDER));
  const isTable = variant === "table";

  useEffect(() => {
    if (deck?.image) setSrc(deckImageSrc(deck.image));
    else setSrc(deckImageSrc(PLACEHOLDER));
  }, [deck?.image]);

  const shellClass = clsx(
    "character-card",
    isTable ? "character-card--table" : "character-card--panel",
    className
  );

  if (hidden || !deck) {
    return (
      <div
        className={clsx(
          shellClass,
          "items-center justify-center border-dashed bg-[var(--card-hidden)]",
          isTable && "character-card--table-hidden"
        )}
      >
        <span className="text-4xl font-bold text-[var(--muted)] md:text-5xl">?</span>
        {isTable && (
          <p className="mt-1 text-center text-sm text-[var(--muted)]">Your story</p>
        )}
      </div>
    );
  }

  const hintCount = isTable ? 3 : 4;
  const factCount = isTable ? 1 : 2;

  return (
    <article className={shellClass}>
      <div
        className={clsx(
          "character-card__image-wrap shrink-0",
          isTable ? "character-card__image-wrap--table" : "character-card__image-wrap--panel"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={deck.imageAlt ?? deck.name}
          width={isTable ? 68 : 136}
          height={isTable ? 100 : 168}
          className="character-card__image"
          loading="lazy"
          decoding="async"
          onError={() => {
            const fallback = deckImageSrc(PLACEHOLDER);
            if (src !== fallback) setSrc(fallback);
          }}
        />
      </div>

      <CardDetails
        deck={deck}
        hintCount={hintCount}
        factCount={factCount}
        size={variant}
      />
    </article>
  );
}
