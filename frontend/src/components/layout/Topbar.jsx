import { Menu, LogOut } from "lucide-react";
import RoleBadge from "../ui/RoleBadge";
import { useAuthStore } from "../../context/useAuthStore";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between">
        <button className="rounded-lg border border-ink-200 p-2 md:hidden" onClick={onMenu}>
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden md:block">
          <p className="text-sm text-ink-500">Smart Inventory & Warehouse Management</p>
          <h1 className="text-lg font-semibold text-ink-900">Production Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge role={user?.role} />
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-ink-800">{user?.name}</p>
            <p className="text-xs text-ink-500">{user?.email}</p>
          </div>
          <button className="rounded-xl border border-ink-200 p-2 text-ink-600 hover:bg-ink-100" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
