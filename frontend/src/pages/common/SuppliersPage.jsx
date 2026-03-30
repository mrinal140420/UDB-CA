import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, Edit, Trash2, Truck, Plus } from "lucide-react";
import api from "../../api/client";
import { useAuthStore } from "../../context/useAuthStore";
import PageHeader from "../../components/ui/PageHeader";
import SearchFilterBar from "../../components/ui/SearchFilterBar";
import FormModal from "../../components/ui/FormModal";
import EmptyState from "../../components/ui/EmptyState";

function StatusBadge({ status }) {
  const isActive = status === "active";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function SuppliersPage() {
  const { user } = useAuthStore();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      supplier_id: "",
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      city: "",
      country: "",
      status: "active",
    },
  });

  const loadSuppliers = () => {
    api.get("/suppliers").then((res) => setSuppliers(res.data.data.suppliers));
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const canEdit = user?.role === "admin" || user?.role === "super_admin";
  const canDelete = user?.role === "super_admin";

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = [s.name, s.supplier_id, s.contact_person, s.email, s.city].some((v) => (v || "").toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const createSupplier = async (payload) => {
    try {
      await api.post("/suppliers", payload);
      toast.success("Supplier created");
      setOpenCreate(false);
      reset();
      loadSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create supplier");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers registered`}
        action={
          canEdit ? (
            <button className="btn-primary" onClick={() => setOpenCreate(true)}>
              <span className="inline-flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Supplier
              </span>
            </button>
          ) : null
        }
      />
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search suppliers..."
        filters={[
          {
            key: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No suppliers found" icon={<Truck className="mb-3 h-10 w-10 text-ink-300" />} />
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="panel animate-pop-in cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-xl"
              onClick={() => {
                setSelected(s);
                setOpenDetail(true);
              }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-ink-500">{s.supplier_id}</span>
                  <h3 className="mt-0.5 font-semibold text-ink-900">{s.name}</h3>
                </div>
                <StatusBadge status={s.status} />
              </div>

              <div className="space-y-1 text-sm text-ink-600">
                <p>
                  Contact: {s.contact_person || "-"} {s.phone ? `- ${s.phone}` : ""}
                </p>
                <p>Email: {s.email || "-"}</p>
                <p>
                  Location: {s.city || "-"}
                  {s.state ? `, ${s.state}` : ""}
                </p>
              </div>

              <div className="mt-3 flex gap-1 border-t border-ink-100 pt-3">
                <button
                  className="rounded-md p-1.5 transition hover:bg-ink-100"
                  title="View"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(s);
                    setOpenDetail(true);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 text-ink-500" />
                </button>
                {canEdit && (
                  <button
                    className="rounded-md p-1.5 transition hover:bg-ink-100"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info("Edit supplier flow can be added next");
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 text-ink-500" />
                  </button>
                )}
                {canDelete && (
                  <button
                    className="rounded-md p-1.5 transition hover:bg-rose-100"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info("Delete supplier flow can be added next");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <FormModal open={openCreate} title="Create Supplier" onClose={() => setOpenCreate(false)}>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit(createSupplier)}>
          <input {...register("supplier_id")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="SUP106" required />
          <input {...register("name")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Supplier name" required />
          <input {...register("contact_person")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Contact person" />
          <input {...register("phone")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Phone" />
          <input {...register("email")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Email" />
          <input {...register("city")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="City" />
          <input {...register("country")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Country" />
          <select {...register("status")} className="rounded-xl border border-ink-200 px-3 py-2.5">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn-primary md:col-span-2">Create Supplier</button>
        </form>
      </FormModal>

      <FormModal open={openDetail} title={selected?.name || "Supplier Details"} onClose={() => setOpenDetail(false)}>
        {selected ? (
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="text-ink-500">ID:</span> <span className="font-mono">{selected.supplier_id}</span>
            </div>
            <div>
              <span className="text-ink-500">Status:</span> <StatusBadge status={selected.status} />
            </div>
            <div>
              <span className="text-ink-500">Contact:</span> {selected.contact_person || "-"}
            </div>
            <div>
              <span className="text-ink-500">Phone:</span> {selected.phone || "-"}
            </div>
            <div>
              <span className="text-ink-500">Email:</span> {selected.email || "-"}
            </div>
            <div>
              <span className="text-ink-500">GST:</span> {selected.gst_number || "-"}
            </div>
            <div className="md:col-span-2">
              <span className="text-ink-500">Address:</span> {selected.address || "-"}
              {selected.city ? `, ${selected.city}` : ""}
              {selected.state ? `, ${selected.state}` : ""}
              {selected.postal_code ? ` ${selected.postal_code}` : ""}
              {selected.country ? `, ${selected.country}` : ""}
            </div>
          </div>
        ) : null}
      </FormModal>
    </div>
  );
}
