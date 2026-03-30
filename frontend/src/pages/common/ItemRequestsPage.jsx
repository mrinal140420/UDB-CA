import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../../components/ui/PageHeader";
import SearchFilterBar from "../../components/ui/SearchFilterBar";
import api from "../../api/client";

export default function ItemRequestsPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/item-requests", {
        params: { status, page: 1, limit: 50 },
      });
      setRows(data.data.requests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch item requests");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const reviewRequest = async (id, decision) => {
    try {
      await api.patch(`/item-requests/${id}/status`, {
        status: decision,
        review_note: decision === "approved" ? "Approved and converted into item" : "Rejected by admin",
      });
      toast.success(`Request ${decision}`);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${decision} request`);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Item Requests" subtitle="Review and process worker requests for new inventory items" />

      <div className="animate-rise-up">
        <SearchFilterBar
          search=""
          onSearchChange={() => {}}
          hideSearch
          filters={[
            {
              key: "status",
              value: status,
              onChange: setStatus,
              options: [
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ],
            },
          ]}
        />
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-ink-100 p-5">
          <h3 className="text-sm font-semibold">Requests List</h3>
          <p className="mt-0.5 text-xs text-ink-500">{loading ? "Loading..." : `${rows.length} request(s) shown`}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-ink-100/60">
                <th className="px-4 py-3 text-left font-medium text-ink-500">Request</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Item Code</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Category</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Supplier</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Requested By</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((req) => (
                <tr key={req._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-mono text-xs">{req.request_code}</td>
                  <td className="px-4 py-3 font-mono text-xs">{req.item_id}</td>
                  <td className="px-4 py-3 font-medium">{req.name}</td>
                  <td className="px-4 py-3 text-ink-500">{req.category}</td>
                  <td className="px-4 py-3 text-ink-500">{req.supplier_id?.name || "-"}</td>
                  <td className="px-4 py-3 text-ink-500">{req.requested_by?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${req.status === "pending" ? "bg-amber-100 text-amber-700" : req.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === "pending" ? (
                      <div className="flex gap-2">
                        <button className="btn-primary py-1 text-xs" onClick={() => reviewRequest(req._id, "approved")}>Approve</button>
                        <button className="btn-secondary py-1 text-xs" onClick={() => reviewRequest(req._id, "rejected")}>Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-400">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-ink-500">
                    No item requests found for this status.
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
