export default function ChartCard({ title, description, className = "", children }) {
  return (
    <div className={`panel p-5 ${className}`.trim()}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">{title}</h3>
      {description ? <p className="mb-3 mt-0.5 text-xs text-ink-500">{description}</p> : <div className="mb-4" />}
      <div className="h-72">{children}</div>
    </div>
  );
}
