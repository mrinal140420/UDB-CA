import { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Package, Truck, ClipboardList, DollarSign, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import ChartCard from "../../components/ui/ChartCard";
import StockBadge from "../../components/ui/StockBadge";
import { formatINR } from "../../utils/currency";

const COLORS = ["#1d4ed8", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2"];

function TransactionBadge({ type }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${type === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
      {type}
    </span>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const pollingRef = useRef(false);

  useEffect(() => {
    let active = true;

    const load = async (silent = false) => {
      try {
        const [summaryRes, categoryRes, movementRes, txRes, lowStockRes] = await Promise.all([
          api.get("/reports/admin-summary"),
          api.get("/reports/category-distribution"),
          api.get("/reports/movement-summary"),
          api.get("/transactions", { params: { page: 1, limit: 8, sort: "-date" } }),
          api.get("/reports/low-stock"),
        ]);

        if (!active) return;

        setSummary(summaryRes.data.data);
        setCategoryData(categoryRes.data.data.data || []);
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
          console.error(error);
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

  if (!summary) return <div className="panel p-6">Loading dashboard...</div>;

  const incomingCount = recentTransactions.filter((tx) => tx.type === "IN").length;
  const outgoingCount = recentTransactions.filter((tx) => tx.type === "OUT").length;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Admin Dashboard" subtitle="Welcome back. Here is your warehouse overview." />

      <div className="stagger-children mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Items" value={summary.totalItems} icon={Package} variant="primary" trend={{ value: 12, positive: true }} />
        <StatCard title="Active Suppliers" value={summary.totalSuppliers} icon={Truck} variant="info" />
        <StatCard title="Transactions" value={summary.totalTransactions} icon={ClipboardList} variant="success" trend={{ value: 8, positive: true }} />
        <StatCard
          title="Low Stock Alerts"
          value={summary.lowStockCount}
          icon={AlertTriangle}
          variant={summary.lowStockCount > 3 ? "danger" : "warning"}
          description={`${summary.lowStockCount} items need restocking`}
        />
        <StatCard title="Total Stock Value" value={formatINR(summary.totalInventoryValue)} icon={DollarSign} variant="default" description="Current inventory value" />
        <StatCard title="Incoming (Recent)" value={incomingCount} icon={ArrowDownToLine} variant="success" />
        <StatCard title="Outgoing (Recent)" value={outgoingCount} icon={ArrowUpFromLine} variant="warning" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Category Distribution" description="Items by category" className="animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="itemCount" nameKey="_id" innerRadius={55} outerRadius={90} paddingAngle={4} isAnimationActive animationDuration={900} animationBegin={120}>
                {categoryData.map((entry, index) => (
                  <Cell key={entry._id || index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stock Value by Category" description="In thousands" className="animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData.map((c) => ({ name: c._id, value: Math.round((c.stockValue || 0) / 1000) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`₹${v}K`, "Value"]} />
              <Bar dataKey="value" fill="#1d4ed8" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900} animationBegin={100} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Stock Movement" description="Incoming vs outgoing trend" className="lg:col-span-2 animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incoming" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} isAnimationActive animationDuration={900} animationBegin={120} />
              <Line type="monotone" dataKey="outgoing" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} isAnimationActive animationDuration={900} animationBegin={220} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-ink-100 p-5">
          <h3 className="text-sm font-semibold">Recent Transactions</h3>
          <p className="mt-0.5 text-xs text-ink-500">Latest stock movements</p>
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
                <th className="px-4 py-3 text-left font-medium text-ink-500">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-mono text-xs">{tx.transaction_id}</td>
                  <td className="px-4 py-3 font-medium">{tx.item_id?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <TransactionBadge type={tx.type} />
                  </td>
                  <td className="px-4 py-3">{tx.quantity}</td>
                  <td className="px-4 py-3">{formatINR(tx.unit_price || 0)}</td>
                  <td className="px-4 py-3 font-semibold">{formatINR(tx.total_amount || 0)}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{tx.performed_by?.name || "-"}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink-500">{tx.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {lowStockItems.length > 0 ? (
        <div className="panel mt-6 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-ink-100 p-5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold">Low Stock Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ink-100/60">
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Item ID</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Current Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Reorder Level</th>
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
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item Name</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Moved Quantity</th>
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
