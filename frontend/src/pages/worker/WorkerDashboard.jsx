import { useEffect, useRef, useState } from "react";
import { Package, AlertTriangle, Repeat, Clock, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StockBadge from "../../components/ui/StockBadge";
import ChartCard from "../../components/ui/ChartCard";
import { formatINR } from "../../utils/currency";

const CHART_ANIM = {
  duration: 900,
  easing: "ease-out",
};

function TransactionBadge({ type }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${type === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
      {type}
    </span>
  );
}

export default function WorkerDashboard() {
  const [summary, setSummary] = useState({ recent: [], lowStock: [], incomingCount: 0, outgoingCount: 0, recentMovementCount: 0, lowStockCount: 0 });
  const navigate = useNavigate();
  const [quickForm, setQuickForm] = useState({ itemCode: "", type: "IN", quantity: 1, unit_price: "", remarks: "" });
  const [quickItem, setQuickItem] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submittingQuick, setSubmittingQuick] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    category: "",
    supplier_id: "",
    unit: "pcs",
    requested_quantity: "",
    suggested_price: "",
    reorder_level: "",
    warehouse_location: "Main",
    remarks: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const pollingRef = useRef(false);

  const loadSummary = async (silent = false) => {
    try {
      const res = await api.get("/reports/worker-summary");
      setSummary(res.data.data || { recent: [], lowStock: [], incomingCount: 0, outgoingCount: 0, recentMovementCount: 0, lowStockCount: 0 });
    } catch (error) {
      if (!silent && error?.response?.status !== 401) {
        toast.error("Failed to load worker dashboard data");
      }
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      await loadSummary();
      try {
        const res = await api.get("/suppliers");
        if (active) {
          setSuppliers(res.data.data.suppliers || []);
        }
      } catch {
        if (active) {
          setSuppliers([]);
        }
      }
    };

    loadInitial();

    const id = setInterval(async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        await loadSummary(true);
      } finally {
        pollingRef.current = false;
      }
    }, 20000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const code = quickForm.itemCode.trim();
    if (!code) {
      setQuickItem(null);
      setLookupLoading(false);
      return;
    }

    const id = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const res = await api.get("/items", {
          params: { page: 1, limit: 20, search: code },
        });
        const items = res.data.data.items || [];
        const exactMatch = items.find((i) => String(i.item_id || "").toLowerCase() === code.toLowerCase());
        const selectedItem = exactMatch || items[0] || null;
        setQuickItem(selectedItem);
        setQuickForm((prev) => ({ ...prev, unit_price: selectedItem ? Number(selectedItem.price || 0) : "" }));
      } catch {
        setQuickItem(null);
        setQuickForm((prev) => ({ ...prev, unit_price: "" }));
      } finally {
        setLookupLoading(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [quickForm.itemCode]);

  const submitQuickEntry = async (e) => {
    e.preventDefault();
    if (!quickItem?._id) {
      toast.error("Please enter a valid item code");
      return;
    }
    if (Number(quickForm.quantity) < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (Number(quickForm.unit_price) < 0) {
      toast.error("Unit price cannot be negative");
      return;
    }

    setSubmittingQuick(true);
    try {
      const endpoint = quickForm.type === "IN" ? "/transactions/in" : "/transactions/out";
      await api.post(endpoint, {
        item_id: quickItem._id,
        quantity: Number(quickForm.quantity),
        unit_price: Number(quickForm.unit_price || quickItem.price || 0),
        remarks: quickForm.remarks,
      });
      toast.success(`${quickForm.type} stock entry submitted`);
      setQuickForm((prev) => ({ ...prev, quantity: 1, remarks: "" }));
      await loadSummary();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit stock entry");
    } finally {
      setSubmittingQuick(false);
    }
  };

  const submitItemRequest = async (e) => {
    e.preventDefault();
    if (!quickForm.itemCode.trim()) {
      toast.error("Enter an item code first");
      return;
    }
    if (!requestForm.name.trim() || !requestForm.category.trim() || !requestForm.supplier_id) {
      toast.error("Name, category, and supplier are required for approval request");
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.post("/item-requests", {
        item_id: quickForm.itemCode.trim().toUpperCase(),
        ...requestForm,
        requested_quantity: Number(requestForm.requested_quantity || 0),
        suggested_price: Number(requestForm.suggested_price || 0),
        reorder_level: Number(requestForm.reorder_level || 0),
      });
      toast.success("Item request submitted to admin for approval");
      setRequestForm({
        name: "",
        category: "",
        supplier_id: "",
        unit: "pcs",
        requested_quantity: "",
        suggested_price: "",
        reorder_level: "",
        warehouse_location: "Main",
        remarks: "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit item request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const inCount = Number(summary.incomingCount || 0);
  const outCount = Number(summary.outgoingCount || 0);
  const movementData = [
    { label: "Incoming", value: inCount },
    { label: "Outgoing", value: outCount },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Worker Dashboard" subtitle="Today stock activity, low stock and quick operational visibility" />

      <div className="stagger-children mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Recent Movements" value={summary.recentMovementCount || 0} icon={Repeat} variant="primary" onClick={() => navigate("/transactions")} />
        <StatCard title="Incoming Entries" value={inCount} icon={ArrowDownToLine} variant="success" onClick={() => navigate("/transactions?type=IN")} />
        <StatCard title="Outgoing Entries" value={outCount} icon={ArrowUpFromLine} variant="warning" onClick={() => navigate("/transactions?type=OUT")} />
        <StatCard
          title="Low Stock Alerts"
          value={summary.lowStockCount || 0}
          icon={AlertTriangle}
          variant={(summary.lowStockCount || 0) > 3 ? "danger" : "warning"}
          onClick={() => navigate("/low-stock")}
        />
      </div>

      <div className="panel mb-6 animate-rise-up p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Quick Stock Entry</h3>
          <p className="mt-0.5 text-xs text-ink-500">Enter item code, choose movement type, and submit in seconds.</p>
        </div>

        <form className="grid grid-cols-1 gap-3 md:grid-cols-6" onSubmit={submitQuickEntry}>
          <input
            value={quickForm.itemCode}
            onChange={(e) => setQuickForm((prev) => ({ ...prev, itemCode: e.target.value }))}
            placeholder="Item Code (e.g. ITM101)"
            className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
          />
          <select
            value={quickForm.type}
            onChange={(e) => setQuickForm((prev) => ({ ...prev, type: e.target.value }))}
            className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
          >
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
          <input
            type="number"
            min="1"
            value={quickForm.quantity}
            onChange={(e) => setQuickForm((prev) => ({ ...prev, quantity: e.target.value }))}
            placeholder="Quantity"
            className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={quickForm.unit_price}
            onChange={(e) => setQuickForm((prev) => ({ ...prev, unit_price: e.target.value }))}
            placeholder="Unit price"
            className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
          />
          <input
            value={quickForm.remarks}
            onChange={(e) => setQuickForm((prev) => ({ ...prev, remarks: e.target.value }))}
            placeholder="Remarks"
            className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
          />
          <button className="btn-primary" disabled={submittingQuick || lookupLoading}>
            {submittingQuick ? "Submitting..." : "Submit Entry"}
          </button>
        </form>

        <div className="mt-3 rounded-xl border border-ink-200 bg-ink-100/40 px-3 py-2 text-xs text-ink-600">
          {lookupLoading && quickForm.itemCode ? "Looking up item code..." : null}
          {!lookupLoading && quickForm.itemCode && quickItem ? (
            <span>
              Matched item: <span className="font-semibold text-ink-900">{quickItem.item_id}</span> - {quickItem.name} | Price: {formatINR(quickItem.price || 0)} | Available: {quickItem.quantity} | Reorder: {quickItem.reorder_level}
            </span>
          ) : null}
          {!lookupLoading && quickForm.itemCode && !quickItem ? "No matching item found for this code." : null}
          {!quickForm.itemCode ? "Tip: Start by entering a valid Item Code." : null}
        </div>

        {!lookupLoading && quickForm.itemCode && !quickItem ? (
          <form className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 md:grid-cols-3" onSubmit={submitItemRequest}>
            <p className="md:col-span-3 text-xs font-semibold text-amber-800">Item not found. Submit request for Admin approval.</p>
            <input
              value={requestForm.name}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Item name (e.g. Thermal Printer)"
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
            />
            <input
              value={requestForm.category}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Category (e.g. Warehouse Devices)"
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
            />
            <select
              value={requestForm.supplier_id}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{`${s.supplier_id} - ${s.name}`}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={requestForm.requested_quantity}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, requested_quantity: e.target.value }))}
              placeholder="Initial quantity (e.g. 20)"
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
            />
            <input
              type="number"
              min="0"
              value={requestForm.suggested_price}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, suggested_price: e.target.value }))}
              placeholder="Suggested unit price (e.g. 1850)"
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
            />
            <input
              type="number"
              min="0"
              value={requestForm.reorder_level}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, reorder_level: e.target.value }))}
              placeholder="Reorder level (e.g. 5)"
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
            />
            <input
              value={requestForm.warehouse_location}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, warehouse_location: e.target.value }))}
              placeholder="Warehouse location (e.g. Rack B-2)"
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
            />
            <input
              value={requestForm.remarks}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, remarks: e.target.value }))}
              placeholder="Reason / remarks for approval"
              className="rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500 md:col-span-2"
            />
            <button className="btn-secondary md:col-span-3" disabled={submittingRequest}>
              {submittingRequest ? "Submitting Request..." : "Request Admin Approval"}
            </button>
          </form>
        ) : null}
      </div>

      <div className="mb-6">
        <ChartCard title="Movement Snapshot" description="Incoming vs outgoing from recent activity" className="animate-rise-up">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationBegin={120}
                animationEasing={CHART_ANIM.easing}
              />
            </BarChart>
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
              </tr>
            </thead>
            <tbody>
              {summary.recent.map((tx) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-100 p-5">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold">Low Stock Alerts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-ink-100/60">
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item Code</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Qty</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Reorder</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.lowStock.map((item) => (
                <tr key={item.item_id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-mono text-xs">{item.item_id}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
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
    </div>
  );
}
