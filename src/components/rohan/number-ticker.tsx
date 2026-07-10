"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The number to display. */
  value: number;
  /** Thousands separator; pass an empty string to disable grouping. */
  separator?: string;
  /** Rendered before the digits, for example "$". */
  prefix?: string;
  /** Rendered after the digits, for example "%". */
  suffix?: string;
}

const SPRING = { stiffness: 200, damping: 26, mass: 0.6 };

function DigitColumn({ mv, digit }: { mv: MotionValue<number>; digit: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
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
      {Array.from({ length: 10 }, (_, index) => (
        <DigitColumn key={index} mv={mv} digit={index} />
      ))}
    </span>
  );
}

/**
 * @rohan/number-ticker
 * An accessible odometer-style number. Each digit lives on a vertical reel
 * and rolls to its new value on a spring, taking the shortest path around it.
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
  const places = Array.from({ length: digitCount }, (_, index) => 10 ** (digitCount - 1 - index));
  const formatted = separator
    ? String(absolute).replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : String(absolute);
  const accessibleValue = `${value < 0 ? "minus " : ""}${prefix ?? ""}${formatted}${suffix ?? ""}`;

  return (
    <span
      className={cn("inline-flex items-center leading-none tabular-nums", className)}
      {...props}
    >
      <span className="sr-only">{accessibleValue}</span>
      <span aria-hidden className="inline-flex items-center">
        {value < 0 && <span>−</span>}
        {prefix && <span>{prefix}</span>}
        {places.map((place, index) => {
          const digitsAfter = places.length - 1 - index;
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
    </span>
  );
}
