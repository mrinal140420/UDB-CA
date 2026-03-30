import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Edit, Eye, UserCog } from "lucide-react";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import RoleBadge from "../../components/ui/RoleBadge";
import SearchFilterBar from "../../components/ui/SearchFilterBar";
import FormModal from "../../components/ui/FormModal";
import EmptyState from "../../components/ui/EmptyState";

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function UserManagementPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "worker",
      phone: "",
    },
  });

  const editForm = useForm({
    defaultValues: {
      name: "",
      phone: "",
      role: "worker",
      status: "active",
    },
  });

  const loadUsers = () => {
    api
      .get("/users")
      .then((res) => setRows(res.data.data.users))
      .catch((error) => {
        if (error?.response?.status !== 401) {
          toast.error("Failed to load users");
        }
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (row) => {
    try {
      await api.patch(`/users/${row._id}/status`, {
        status: row.status === "active" ? "inactive" : "active",
      });
      toast.success("User status updated");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [rows, search, roleFilter]);

  const handleCreateUser = async (payload) => {
    setIsSubmitting(true);
    try {
      await api.post("/users", payload);
      toast.success("User created successfully");
      setOpenCreate(false);
      createForm.reset();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelected(user);
    editForm.reset({
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "worker",
      status: user.status || "active",
    });
    setOpenEdit(true);
  };

  const handleEditUser = async (payload) => {
    if (!selected?._id) return;
    setIsSubmitting(true);

    try {
      await api.put(`/users/${selected._id}`, {
        name: payload.name,
        phone: payload.phone,
        status: payload.status,
      });

      if (payload.role !== selected.role) {
        await api.patch(`/users/${selected._id}/role`, { role: payload.role });
      }

      if (payload.status !== selected.status) {
        await api.patch(`/users/${selected._id}/status`, { status: payload.status });
      }

      toast.success("User updated successfully");
      setOpenEdit(false);
      setSelected(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle="Manage system users and roles"
        action={
          <button className="btn-primary" onClick={() => setOpenCreate(true)}>
            <span className="inline-flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add User
            </span>
          </button>
        }
      />

      <div className="animate-rise-up">
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users..."
          filters={[
            {
              key: "role",
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: "all", label: "All Roles" },
                { value: "super_admin", label: "Super Admin" },
                { value: "admin", label: "Admin" },
                { value: "worker", label: "Worker" },
              ],
            },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users found" icon={<UserCog className="mb-3 h-10 w-10 text-ink-300" />} />
      ) : (
        <div className="panel animate-rise-up overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ink-100/60">
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Status</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-ink-500 md:table-cell">Last Login</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} className="border-b border-ink-100 last:border-0 transition-colors hover:bg-ink-100/35">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {(u.name || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-ink-500 md:table-cell">{u.last_login ? new Date(u.last_login).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          className="rounded-md p-1.5 transition hover:bg-ink-100"
                          onClick={() => setSelected(u)}
                          title="View user"
                        >
                          <Eye className="h-3.5 w-3.5 text-ink-500" />
                        </button>
                        <button
                          className="rounded-md p-1.5 transition hover:bg-ink-100"
                          onClick={() => openEditModal(u)}
                          title="Edit user"
                        >
                          <Edit className="h-3.5 w-3.5 text-ink-500" />
                        </button>
                        <button className="btn-secondary py-1 text-xs" onClick={() => toggleStatus(u)}>
                          Toggle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormModal open={openCreate} title="Create User" onClose={() => setOpenCreate(false)}>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={createForm.handleSubmit(handleCreateUser)}>
          <input {...createForm.register("name")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Full name" required />
          <input {...createForm.register("email")} type="email" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Email" required />
          <input {...createForm.register("password")} type="password" className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Password" required />
          <select {...createForm.register("role")} className="rounded-xl border border-ink-200 px-3 py-2.5">
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <input {...createForm.register("phone")} className="rounded-xl border border-ink-200 px-3 py-2.5 md:col-span-2" placeholder="Phone (optional)" />
          <button disabled={isSubmitting} className="btn-primary md:col-span-2">
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </FormModal>

      <FormModal
        open={openEdit}
        title={`Edit User - ${selected?.name || ""}`}
        onClose={() => {
          setOpenEdit(false);
          setSelected(null);
        }}
      >
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={editForm.handleSubmit(handleEditUser)}>
          <input {...editForm.register("name")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Full name" required />
          <input {...editForm.register("phone")} className="rounded-xl border border-ink-200 px-3 py-2.5" placeholder="Phone" />
          <select {...editForm.register("role")} className="rounded-xl border border-ink-200 px-3 py-2.5">
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select {...editForm.register("status")} className="rounded-xl border border-ink-200 px-3 py-2.5">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button disabled={isSubmitting} className="btn-primary md:col-span-2">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </FormModal>

      <FormModal open={!!selected && !openEdit} title={selected?.name || "User Details"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="text-ink-500">Email:</span> {selected.email}
            </div>
            <div>
              <span className="text-ink-500">Role:</span> <RoleBadge role={selected.role} />
            </div>
            <div>
              <span className="text-ink-500">Status:</span> <StatusBadge status={selected.status} />
            </div>
            <div>
              <span className="text-ink-500">Phone:</span> {selected.phone || "-"}
            </div>
            <div>
              <span className="text-ink-500">Last Login:</span> {selected.last_login ? new Date(selected.last_login).toLocaleString() : "-"}
            </div>
            <div>
              <span className="text-ink-500">Created:</span> {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "-"}
            </div>
          </div>
        ) : null}
      </FormModal>
    </div>
  );
}
