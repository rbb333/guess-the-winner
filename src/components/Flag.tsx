const SIZES = {
  xs: { w: 20, h: 15, text: 7 },
  sm: { w: 28, h: 21, text: 8 },
  md: { w: 40, h: 30, text: 10 },
  lg: { w: 72, h: 54, text: 14 },
} as const;

type Props = {
  code: string; // flag-icons code, "" when the state no longer has an SVG
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
};

/** Country flag from the bundled flag-icons set; falls back to a code badge. */
export function Flag({ code, name, size = "md", className = "" }: Props) {
  const { w, h, text } = SIZES[size];
  if (code) {
    return (
      <span
        role="img"
        aria-label={`Flag of ${name}`}
        className={`fi fi-${code} inline-block shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/30 ${className}`}
        style={{ width: w, height: h, lineHeight: 1 }}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-[2px] bg-slate-500 font-bold tracking-wide text-white ring-1 ring-black/30 ${className}`}
      style={{ width: w, height: h, fontSize: text }}
    >
      {name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 3)
        .toUpperCase()}
    </span>
  );
}
