import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../api/client";

export default function MyItemRequestsPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/item-requests", {
        params: { mine: true, status, page: 1, limit: 50 },
      });
      setRows(data.data.requests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch your item requests");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Item Requests" subtitle="Track approval status for new item requests submitted to Admin" />

      <div className="panel mb-4 flex items-center justify-between gap-3 p-4">
        <p className="text-sm text-ink-500">{loading ? "Loading requests..." : `${rows.length} request(s)`}</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-ink-100/60">
                <th className="px-4 py-3 text-left font-medium text-ink-500">Request</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item Code</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Category</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Reviewed By</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Reviewed At</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((req) => (
                <tr key={req._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-mono text-xs">{req.request_code}</td>
                  <td className="px-4 py-3 font-mono text-xs">{req.item_id}</td>
                  <td className="px-4 py-3 font-medium">{req.name}</td>
                  <td className="px-4 py-3 text-ink-500">{req.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        req.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : req.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{req.reviewed_by?.name || "-"}</td>
                  <td className="px-4 py-3 text-ink-500">{req.reviewed_at ? new Date(req.reviewed_at).toLocaleString() : "-"}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-ink-500">{req.review_note || "-"}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-ink-500">
                    No requests found. Create one from Worker Dashboard Quick Stock Entry when item code is missing.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
