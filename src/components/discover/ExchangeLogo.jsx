import Image from "next/image";

export default function ExchangeLogo({ src, name, size = 32 }) {
  if (src) {
    return (
      <div className="relative shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]" style={{ width: size, height: size }}>
        <Image src={src} alt="" width={size} height={size} className="h-full w-full rounded-full object-contain" />
      </div>
    );
  }

  const initial = (name ?? "?").trim().charAt(0)?.toUpperCase() ?? "?";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold"
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      aria-label={name || "Exchange logo"}
    >
      {initial}
    </div>
  );
}
