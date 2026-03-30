import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../../api/client";
import { useAuthStore } from "../../context/useAuthStore";
import { useDebounce } from "../../hooks/useDebounce";
import PageHeader from "../../components/ui/PageHeader";
import SearchFilterBar from "../../components/ui/SearchFilterBar";
import DataTable from "../../components/ui/DataTable";
import StockBadge from "../../components/ui/StockBadge";
import FormModal from "../../components/ui/FormModal";
import { formatINR } from "../../utils/currency";

export default function ItemsPage() {
  const { user } = useAuthStore();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [suppliers, setSuppliers] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      item_id: "",
      name: "",
      category: "",
      quantity: "",
      unit: "pcs",
      price: "",
      supplier_id: "",
      warehouse_location: "Main",
      reorder_level: "",
      status: "active",
    },
  });

  const debouncedSearch = useDebounce(search);

  const fetchItems = async (page = 1) => {
    try {
      const { data } = await api.get("/items", {
        params: { search: debouncedSearch, category, status, page, limit: 10, sort: "-createdAt" },
      });
      setRows(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch items");
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [debouncedSearch, category, status]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      api.get("/suppliers").then((res) => setSuppliers(res.data.data.suppliers));
    }
  }, [user?.role]);

  const createItem = async (payload) => {
    try {
      await api.post("/items", payload);
      toast.success("Item created");
      setOpenCreate(false);
      reset();
      fetchItems(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create item");
    }
  };

  const categories = useMemo(() => {
    const set = new Set(rows.map((r) => r.category));
    return ["", ...set];
  }, [rows]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Items"
        subtitle="Inventory listing with search, stock status, and role-aware actions"
        action={
          user?.role === "admin" || user?.role === "super_admin" ? (
            <button className="btn-primary" onClick={() => setOpenCreate(true)}>
              Create Item
            </button>
          ) : null
        }
      />
      <div className="animate-rise-up">
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "category",
            value: category,
            onChange: setCategory,
            options: [{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c, label: c || "All" }))],
          },
          {
            key: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "", label: "All status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
      />
      </div>

      <DataTable
        columns={[
          { key: "item_id", label: "Item ID" },
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "quantity", label: "Qty" },
          { key: "price", label: "Price", render: (r) => formatINR(r.price) },
          { key: "supplier", label: "Supplier", render: (r) => r.supplier_id?.name || "-" },
          { key: "stock", label: "Stock", render: (r) => <StockBadge quantity={r.quantity} reorderLevel={r.reorder_level} /> },
          { key: "location", label: "Location", render: (r) => r.warehouse_location },
        ]}
        rows={rows}
        actions={(row) => (
          <div className="flex gap-2">
            <Link className="btn-secondary py-1 text-xs" to={`/items/${row._id}`}>
              View
            </Link>
            {(user?.role === "admin" || user?.role === "super_admin") && <button className="btn-secondary py-1 text-xs">Edit</button>}
          </div>
        )}
        pagination={pagination}
        onPageChange={fetchItems}
      />

      <FormModal open={openCreate} title="Create Inventory Item" onClose={() => setOpenCreate(false)}>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit(createItem)}>
          <input {...register("item_id")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Item code (e.g. ITM111)" required />
          <input {...register("name")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Item name (e.g. Thermal Printer)" required />
          <input {...register("category")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Category (e.g. Peripherals)" required />
          <input {...register("quantity", { valueAsNumber: true })} type="number" min="0" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Opening quantity (e.g. 25)" required />
          <input {...register("unit")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Unit (e.g. pcs)" required />
          <input {...register("price", { valueAsNumber: true })} type="number" min="0" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Unit price (e.g. 2999)" required />
          <select {...register("supplier_id")} className="rounded-xl border border-ink-200 px-3 py-2.5" required>
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{`${s.supplier_id} - ${s.name}`}</option>
            ))}
          </select>
          <input {...register("warehouse_location")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Warehouse location (e.g. Rack A-3)" required />
          <input {...register("reorder_level", { valueAsNumber: true })} type="number" min="0" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Reorder level (e.g. 5)" required />
          <select {...register("status")} className="rounded-xl border border-ink-200 px-3 py-2.5">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn-primary md:col-span-2">Create Item</button>
        </form>
      </FormModal>
    </div>
  );
}
