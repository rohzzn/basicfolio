"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The number to display */
  value: number;
  /** Thousands separator; pass "" to disable grouping */
  separator?: string;
  /** Rendered before the digits, e.g. "$" */
  prefix?: string;
  /** Rendered after the digits, e.g. "%" */
  suffix?: string;
}

const SPRING = { stiffness: 200, damping: 26, mass: 0.6 };

function DigitColumn({ mv, digit }: { mv: MotionValue<number>; digit: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    // Shortest signed distance from this glyph to the current digit,
    // so columns roll through the near side of the reel.
    let offset = (10 + digit - placeValue) % 10;
    if (offset > 5) offset -= 10;
    return `${offset}em`;
  });

  return (
    <motion.span style={{ y }} className="absolute inset-0 flex items-center justify-center">
      {digit}
    </motion.span>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  const target = Math.floor(value / place);
  const mv = useSpring(target, SPRING);

  useEffect(() => {
    mv.set(target);
  }, [mv, target]);

  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden">
      {Array.from({ length: 10 }, (_, i) => (
        <DigitColumn key={i} mv={mv} digit={i} />
      ))}
    </span>
  );
}

/**
 * @rohan/number-ticker
 * An odometer-style number. Each digit lives on a vertical reel and rolls
 * to its new value on a spring, taking the shortest path around the loop.
 */
export function NumberTicker({
  value,
  separator = ",",
  prefix,
  suffix,
  className,
  ...props
}: NumberTickerProps) {
  const absolute = Math.abs(Math.round(value));
  const digitCount = Math.max(1, String(absolute).length);
  const places = Array.from({ length: digitCount }, (_, i) => 10 ** (digitCount - 1 - i));

  return (
    <span
      className={cn("inline-flex items-center leading-none tabular-nums", className)}
      {...props}
    >
      {value < 0 && <span>−</span>}
      {prefix && <span>{prefix}</span>}
      {places.map((place, i) => {
        const digitsAfter = places.length - 1 - i;
        return (
          <React.Fragment key={place}>
            <Digit place={place} value={absolute} />
            {separator && digitsAfter > 0 && digitsAfter % 3 === 0 && (
              <span className="mx-px">{separator}</span>
            )}
          </React.Fragment>
        );
      })}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
