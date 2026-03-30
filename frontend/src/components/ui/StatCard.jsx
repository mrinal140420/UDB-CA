import { ArrowUpRight } from "lucide-react";

const variantStyles = {
  default: "from-white to-ink-100/40",
  primary: "from-blue-50 to-blue-100/70",
  success: "from-emerald-50 to-emerald-100/70",
  warning: "from-amber-50 to-amber-100/70",
  danger: "from-rose-50 to-rose-100/70",
  info: "from-cyan-50 to-cyan-100/70",
};

export default function StatCard({ title, value, hint, icon: Icon, description, trend, variant = "default", onClick }) {
  const sharedClass = `panel bg-gradient-to-br p-5 ${variantStyles[variant] || variantStyles.default}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClass} cursor-pointer text-left transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-300`}
      >
        <div className="mb-3 flex items-start justify-between">
          <p className="text-sm text-ink-500">{title}</p>
          {Icon ? <Icon className="h-5 w-5 text-brand-700" /> : <ArrowUpRight className="h-5 w-5 text-brand-700" />}
        </div>
        <h3 className="text-2xl font-bold text-ink-900">{value}</h3>
        {(hint || description) && <p className="mt-1 text-xs text-ink-500">{hint || description}</p>}
        {trend ? <p className={`mt-2 text-xs font-medium ${trend.positive ? "text-emerald-700" : "text-rose-700"}`}>{trend.positive ? "+" : ""}{trend.value}%</p> : null}
      </button>
    );
  }

  return (
    <div className={sharedClass}>
      <div className="mb-3 flex items-start justify-between">
        <p className="text-sm text-ink-500">{title}</p>
        {Icon ? <Icon className="h-5 w-5 text-brand-700" /> : <ArrowUpRight className="h-5 w-5 text-brand-700" />}
      </div>
      <h3 className="text-2xl font-bold text-ink-900">{value}</h3>
      {(hint || description) && <p className="mt-1 text-xs text-ink-500">{hint || description}</p>}
      {trend ? <p className={`mt-2 text-xs font-medium ${trend.positive ? "text-emerald-700" : "text-rose-700"}`}>{trend.positive ? "+" : ""}{trend.value}%</p> : null}
    </div>
  );
}
