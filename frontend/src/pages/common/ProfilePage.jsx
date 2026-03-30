import PageHeader from "../../components/ui/PageHeader";
import RoleBadge from "../../components/ui/RoleBadge";
import { useAuthStore } from "../../context/useAuthStore";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="animate-fade-in">
      <PageHeader title="Profile" subtitle="Account details and role information" />
      <div className="panel animate-rise-up max-w-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{user?.name}</h3>
          <RoleBadge role={user?.role} />
        </div>
        <div className="stagger-children mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-ink-500">Email</p>
            <p className="font-medium text-ink-800">{user?.email}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-ink-500">Status</p>
            <p className="font-medium text-ink-800">{user?.status}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-ink-500">Phone</p>
            <p className="font-medium text-ink-800">{user?.phone || "Not set"}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-ink-500">Last Login</p>
            <p className="font-medium text-ink-800">{user?.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
