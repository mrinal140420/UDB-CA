import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/client";
import { useAuthStore } from "../../context/useAuthStore";
import PageHeader from "../../components/ui/PageHeader";
import SearchFilterBar from "../../components/ui/SearchFilterBar";
import DataTable from "../../components/ui/DataTable";
import FormModal from "../../components/ui/FormModal";
import { formatINR } from "../../utils/currency";

export default function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get("type");
  const initialType = queryType === "IN" || queryType === "OUT" ? queryType : "";

  const { user } = useAuthStore();
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [type, setType] = useState(initialType);
  const [search, setSearch] = useState("");
  const [showIn, setShowIn] = useState(false);
  const [showOut, setShowOut] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const { register, handleSubmit, reset } = useForm({ defaultValues: { item_id: "", quantity: 1, unit_price: 0, remarks: "" } });

  const canCreate = ["worker", "admin", "super_admin"].includes(user?.role);

  const fetchRows = async (page = 1) => {
    const { data } = await api.get("/transactions", {
      params: {
        page,
        limit: 10,
        type,
        sort: "-date",
      },
    });
    let tx = data.data.transactions;
    if (search) {
      tx = tx.filter((t) => (t.item_id?.name || "").toLowerCase().includes(search.toLowerCase()));
    }
    setRows(tx);
    setPagination(data.data.pagination);
  };

  useEffect(() => {
    fetchRows(1);
  }, [type, search]);

  useEffect(() => {
    const nextType = queryType === "IN" || queryType === "OUT" ? queryType : "";
    setType(nextType);
  }, [queryType]);

  useEffect(() => {
    api.get("/items", { params: { page: 1, limit: 100 } }).then((res) => setItems(res.data.data.items));
  }, []);

  const submitStock = async (form, mode) => {
    try {
      const endpoint = mode === "IN" ? "/transactions/in" : "/transactions/out";
      await api.post(endpoint, form);
      toast.success(`${mode} transaction recorded`);
      reset();
      setShowIn(false);
      setShowOut(false);
      fetchRows(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create transaction");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transactions"
        subtitle="Incoming and outgoing stock movement history"
        action={
          canCreate ? (
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => setShowIn(true)}>
                Add Stock IN
              </button>
              <button className="btn-secondary" onClick={() => setShowOut(true)}>
                Add Stock OUT
              </button>
            </div>
          ) : null
        }
      />

      <div className="animate-rise-up">
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "type",
            value: type,
            onChange: setType,
            options: [
              { value: "", label: "All type" },
              { value: "IN", label: "IN" },
              { value: "OUT", label: "OUT" },
            ],
          },
        ]}
      />
      </div>

      <DataTable
        columns={[
          { key: "transaction_id", label: "Tx ID" },
          { key: "item", label: "Item", render: (r) => r.item_id?.name },
          { key: "type", label: "Type" },
          { key: "quantity", label: "Qty" },
          { key: "unit_price", label: "Unit Price", render: (r) => formatINR(r.unit_price) },
          { key: "total_amount", label: "Amount", render: (r) => formatINR(r.total_amount) },
          { key: "performed_by", label: "By", render: (r) => r.performed_by?.name || "-" },
          { key: "performed_by_role", label: "Role" },
          { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleString() },
        ]}
        rows={rows}
        pagination={pagination}
        onPageChange={fetchRows}
      />

      <FormModal open={showIn} title="Record Incoming Stock" onClose={() => setShowIn(false)}>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit((v) => submitStock(v, "IN"))}>
          <select {...register("item_id")} className="rounded-xl border border-ink-200 px-3 py-2.5" required>
            <option value="">Select item</option>
            {items.map((i) => (
              <option key={i._id} value={i._id}>{`${i.item_id} - ${i.name}`}</option>
            ))}
          </select>
          <input {...register("quantity", { valueAsNumber: true })} type="number" min="1" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Quantity" />
          <input {...register("unit_price", { valueAsNumber: true })} type="number" min="0" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Unit price" />
          <input {...register("remarks")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Remarks" />
          <button className="btn-primary md:col-span-2">Submit IN</button>
        </form>
      </FormModal>

      <FormModal open={showOut} title="Record Outgoing Stock" onClose={() => setShowOut(false)}>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit((v) => submitStock(v, "OUT"))}>
          <select {...register("item_id")} className="rounded-xl border border-ink-200 px-3 py-2.5" required>
            <option value="">Select item</option>
            {items.map((i) => (
              <option key={i._id} value={i._id}>{`${i.item_id} - ${i.name}`}</option>
            ))}
          </select>
          <input {...register("quantity", { valueAsNumber: true })} type="number" min="1" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Quantity" />
          <input {...register("unit_price", { valueAsNumber: true })} type="number" min="0" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Unit price" />
          <input {...register("remarks")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Remarks" />
          <button className="btn-primary md:col-span-2">Submit OUT</button>
        </form>
      </FormModal>
    </div>
  );
}
