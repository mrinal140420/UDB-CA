import { useEffect, useRef, useState } from "react";
import { Users, ShieldCheck, Activity, Layers, DollarSign, AlertCircle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import ChartCard from "../../components/ui/ChartCard";
import StockBadge from "../../components/ui/StockBadge";
import { formatINR } from "../../utils/currency";

const CHART_ANIM = {
  duration: 900,
  easing: "ease-out",
};

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const pollingRef = useRef(false);

  useEffect(() => {
    let active = true;

    const load = async (silent = false) => {
      try {
        const [summaryRes, txRes, lowStockRes, movementRes] = await Promise.all([
          api.get("/reports/super-admin-summary"),
          api.get("/transactions", { params: { page: 1, limit: 8, sort: "-date" } }),
          api.get("/reports/low-stock"),
          api.get("/reports/movement-summary"),
        ]);

        if (!active) return;

        setSummary(summaryRes.data.data);
        setRecentTransactions(txRes.data.data.transactions || []);
        setLowStockItems(lowStockRes.data.data.lowStock || []);

        const byMonth = {};
        (movementRes.data.data.data || []).forEach((entry) => {
          const month = entry._id?.month || "N/A";
          const type = entry._id?.type || "IN";
          if (!byMonth[month]) {
            byMonth[month] = { month, incoming: 0, outgoing: 0 };
          }
          if (type === "IN") byMonth[month].incoming = entry.totalQuantity;
          if (type === "OUT") byMonth[month].outgoing = entry.totalQuantity;
        });
        setMonthlyData(Object.values(byMonth));
      } catch (error) {
        if (!silent && error?.response?.status !== 401) {
          toast.error("Failed to load super admin dashboard data");
        }
      }
    };

    load();

    const id = setInterval(async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        await load(true);
      } finally {
        pollingRef.current = false;
      }
    }, 20000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!summary) return <div className="panel p-6">Loading platform analytics...</div>;

  const incomingCount = recentTransactions.filter((tx) => tx.type === "IN").length;
  const outgoingCount = recentTransactions.filter((tx) => tx.type === "OUT").length;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Super Admin Dashboard" subtitle="Platform-wide analytics, user control and audit visibility" />

      <div className="stagger-children mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={summary.totalUsers} icon={Users} variant="default" description={`${summary.usersByRole?.reduce((acc, r) => acc + r.count, 0) || 0} tracked users`} />
        <StatCard title="Items" value={summary.totalItems} icon={Layers} variant="primary" />
        <StatCard title="Suppliers" value={summary.totalSuppliers} icon={ShieldCheck} variant="info" />
        <StatCard title="Transactions" value={summary.totalTransactions} icon={Activity} variant="success" />
        <StatCard title="Inventory Value" value={formatINR(summary.totalInventoryValue)} icon={DollarSign} variant="default" />
        <StatCard title="Low Stock" value={summary.lowStockCount} icon={AlertCircle} variant={summary.lowStockCount > 3 ? "danger" : "warning"} />
        <StatCard title="Incoming (Recent)" value={incomingCount} icon={ArrowDownToLine} variant="success" />
        <StatCard title="Outgoing (Recent)" value={outgoingCount} icon={ArrowUpFromLine} variant="warning" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Users by Role" description="Role distribution on the platform" className="animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.usersByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0f766e" isAnimationActive animationDuration={CHART_ANIM.duration} animationBegin={100} animationEasing={CHART_ANIM.easing} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Transaction Count by Role" description="Who is performing movements" className="animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.transactionByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" isAnimationActive animationDuration={CHART_ANIM.duration} animationBegin={140} animationEasing={CHART_ANIM.easing} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Stock Movement" description="Incoming vs outgoing trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incoming" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} isAnimationActive animationDuration={CHART_ANIM.duration} animationBegin={120} animationEasing={CHART_ANIM.easing} />
              <Line type="monotone" dataKey="outgoing" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} isAnimationActive animationDuration={CHART_ANIM.duration} animationBegin={220} animationEasing={CHART_ANIM.easing} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-ink-100 p-5">
          <h3 className="text-sm font-semibold">Recent Transactions</h3>
          <p className="mt-0.5 text-xs text-ink-500">Latest stock movements across roles</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-ink-100/60">
                <th className="px-4 py-3 text-left font-medium text-ink-500">ID</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Qty</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Unit Price</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">By</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Role</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-mono text-xs">{tx.transaction_id}</td>
                  <td className="px-4 py-3 font-medium">{tx.item_id?.name || "-"}</td>
                  <td className="px-4 py-3">{tx.type}</td>
                  <td className="px-4 py-3">{tx.quantity}</td>
                  <td className="px-4 py-3">{formatINR(tx.unit_price || 0)}</td>
                  <td className="px-4 py-3 font-semibold">{formatINR(tx.total_amount || 0)}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{tx.performed_by?.name || "-"}</td>
                  <td className="px-4 py-3">{tx.performed_by_role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {lowStockItems.length > 0 ? (
        <div className="panel mt-6 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-ink-100 p-5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold">Low Stock Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ink-100/60">
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Item ID</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Reorder</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.item_id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                    <td className="px-4 py-3 font-mono text-xs">{item.item_id}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-ink-500">{item.category}</td>
                    <td className="px-4 py-3 font-semibold">{item.quantity}</td>
                    <td className="px-4 py-3 text-ink-500">{item.reorder_level}</td>
                    <td className="px-4 py-3">
                      <StockBadge quantity={item.quantity} reorderLevel={item.reorder_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <PageHeader title="Top Moved Items" />
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-ink-100/60">
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item Code</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Moved Qty</th>
              </tr>
            </thead>
            <tbody>
              {summary.topMovedItems.map((item) => (
                <tr key={item.item_id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{item.item_id}</td>
                  <td className="px-4 py-3 font-medium">{item.item}</td>
                  <td className="px-4 py-3">{item.movedQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
