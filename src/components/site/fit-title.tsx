/**
 * Display heading sized so its longest word always fits the container width on one line
 * (never "PRODAVNIC-A"). `maxWidth` is the page container's max width in px.
 */
export function FitTitle({ text, max = "9rem", maxWidth = 1440, className = "", as: Tag = "h1" }: { text: string; max?: string; maxWidth?: number; className?: string; as?: "h1" | "h2" }) {
  const longest = Math.max(...text.split(/\s+/).map((w) => w.length));
  return (
    <Tag
      className={`display [--pad:2rem] md:[--pad:4rem] ${className}`}
      style={{ fontSize: `min(${max}, calc((min(100vw, ${maxWidth}px) - var(--pad)) / ${(longest * 0.9).toFixed(2)}))` }}
    >
      {text}
    </Tag>
  );
}
