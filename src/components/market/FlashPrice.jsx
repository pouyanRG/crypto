"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export default function FlashPrice({ value, children, className = undefined }) {
  const [prev, setPrev] = useState(value);
  const [flash, setFlash] = useState(null);

  if (value !== prev) {
    setPrev(value);
    if (Number.isFinite(value) && Number.isFinite(prev)) {
      setFlash((current) => ({ direction: value > prev ? "up" : "down", id: (current?.id ?? 0) + 1 }));
    }
  }

  useEffect(() => {
    if (!flash) return;
    const timeout = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(timeout);
  }, [flash]);

  return (
    <span
      key={flash?.id ?? "idle"}
      className={clsx("-mx-1 rounded-[var(--radius-sm)] px-1", flash && `price-flash-${flash.direction}`, className)}
    >
      {children}
    </span>
  );
}
