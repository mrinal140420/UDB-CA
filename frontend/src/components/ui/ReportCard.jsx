export default function ReportCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-4">
      <p className="text-xs uppercase tracking-wide text-brand-700">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-ink-900">{value}</h3>
      {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}
    </div>
  );
}
