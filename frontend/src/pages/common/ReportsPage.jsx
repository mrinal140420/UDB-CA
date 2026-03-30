import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import ChartCard from "../../components/ui/ChartCard";
import { DollarSign, Package, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { formatINR, formatINRCompact } from "../../utils/currency";

const COLORS = ["#1d4ed8", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2"];
const CHART_ANIM = {
  duration: 900,
  easing: "ease-out",
};

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [movementData, setMovementData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summary, setSummary] = useState({ totalItems: 0, lowStockCount: 0 });
  const [totalValue, setTotalValue] = useState(0);
  const pollingRef = useRef(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [summaryRes, stockRes, categoryRes, movementRes, suppliersRes] = await Promise.all([
        api.get("/reports/admin-summary"),
        api.get("/reports/stock-value"),
        api.get("/reports/category-distribution"),
        api.get("/reports/movement-summary"),
        api.get("/suppliers"),
      ]);

      if (!active) return;

      const movementRaw = movementRes.data.data.data || [];
      const incomingQty = movementRaw.filter((m) => m._id?.type === "IN").reduce((sum, m) => sum + Number(m.totalQuantity || 0), 0);
      const outgoingQty = movementRaw.filter((m) => m._id?.type === "OUT").reduce((sum, m) => sum + Number(m.totalQuantity || 0), 0);
      const txCount = movementRaw.reduce((sum, m) => sum + Number(m.count || 0), 0);

      setSummary(summaryRes.data.data || { totalItems: 0, lowStockCount: 0 });
      setTotalValue(stockRes.data.data.totalInventoryValue || 0);
      setItems(stockRes.data.data.items || []);
      setSuppliers(suppliersRes.data.data.suppliers || []);
      setCategoryData(categoryRes.data.data.data || []);
      setTransactionsCount(txCount);
      setMovementData([
        { name: "Incoming", value: incomingQty },
        { name: "Outgoing", value: outgoingQty },
      ]);
    };

    load();

    const id = setInterval(async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        await load();
      } finally {
        pollingRef.current = false;
      }
    }, 20000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const categoryValueData = useMemo(() => {
    return categoryData
      .map((c) => ({ name: c._id || "Others", value: Math.round(Number(c.stockValue || 0) / 1000) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryData]);

  const supplierItemCount = useMemo(
    () =>
      suppliers
        .map((s) => ({
          name: (s.name || "").split(" ")[0] || s.name,
          items: items.filter((i) => String(i.supplier_id?._id || i.supplier_id) === String(s._id)).length,
        }))
        .sort((a, b) => b.items - a.items),
    [suppliers, items]
  );

  const itemValues = useMemo(
    () =>
      items
        .map((i) => ({
          ...i,
          stockValue: Number(i.quantity || 0) * Number(i.price || 0),
        }))
        .sort((a, b) => b.stockValue - a.stockValue),
    [items]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" subtitle="Inventory analytics and reports" />

      <div className="stagger-children mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Stock Value" value={formatINRCompact(totalValue)} icon={DollarSign} variant="primary" />
        <StatCard title="Total Items" value={summary.totalItems || items.length} icon={Package} variant="info" />
        <StatCard title="Low Stock Items" value={summary.lowStockCount || 0} icon={TrendingUp} variant="warning" />
        <StatCard title="Total Transactions" value={transactionsCount} icon={BarChart3} variant="success" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Stock Value by Category (₹K)" className="animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryValueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`₹${v}K`, "Value"]} />
              <Bar
                dataKey="value"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationBegin={150}
                animationEasing={CHART_ANIM.easing}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stock Movement Summary" className="animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={movementData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationBegin={220}
                animationEasing={CHART_ANIM.easing}
              >
                <Cell fill="#16a34a" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Items per Supplier" className="lg:col-span-2 animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierItemCount}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar
                dataKey="items"
                fill="#0891b2"
                radius={[4, 4, 0, 0]}
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationBegin={180}
                animationEasing={CHART_ANIM.easing}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="panel animate-rise-up overflow-hidden">
        <div className="border-b border-ink-100 p-5">
          <h3 className="text-sm font-semibold">Item-wise Stock Value</h3>
          <p className="text-xs text-ink-500">Total value = quantity × price</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-ink-100/60">
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Category</th>
                <th className="px-4 py-3 text-right font-medium text-ink-500">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-ink-500">Unit Price</th>
                <th className="px-4 py-3 text-right font-medium text-ink-500">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {itemValues.map((i) => (
                <tr key={i._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3 text-ink-500">{i.category}</td>
                  <td className="px-4 py-3 text-right">{i.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatINR(i.price)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatINR(i.stockValue)}</td>
                </tr>
              ))}
              <tr className="bg-ink-100/60 font-bold">
                <td className="px-4 py-3" colSpan={4}>
                  Total Inventory Value
                </td>
                <td className="px-4 py-3 text-right">{formatINR(totalValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
