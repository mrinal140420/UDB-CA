export default function StockBadge({ quantity, reorderLevel }) {
  const low = Number(quantity) < Number(reorderLevel);
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${low ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
      {low ? "Low Stock" : "Healthy"}
    </span>
  );
}
