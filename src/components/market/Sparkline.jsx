export default function Sparkline({ data = [], positive = true, className = "h-7 w-16" }) {
  const raw = data.map((point) => point.value).filter(Number.isFinite);
  if (raw.length < 2) return <span className="text-xs text-[var(--color-text-muted)]">–</span>;

  const step = Math.ceil(raw.length / 40);
  const values = raw.filter((_, index) => index % step === 0 || index === raw.length - 1);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const width = 64;
  const height = 28;
  const padding = 2;
  const points = values
    .map((value, index) => `${((index / (values.length - 1)) * width).toFixed(1)},${(height - padding - ((value - min) / range) * (height - padding * 2)).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      className={className}
      aria-label={positive ? "Positive seven-day trend" : "Negative seven-day trend"}
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "var(--color-up)" : "var(--color-down)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}