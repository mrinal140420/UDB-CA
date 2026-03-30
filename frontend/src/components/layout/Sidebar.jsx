import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Boxes,
  ClipboardList,
  ClipboardCheck,
  FileBarChart2,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  Truck,
  User,
  Users,
} from "lucide-react";

const navConfig = {
  worker: [
    { to: "/worker", label: "Dashboard", icon: Home },
    { to: "/items", label: "Items", icon: Boxes },
    { to: "/transactions", label: "Transactions", icon: ClipboardList },
    { to: "/my-requests", label: "My Requests", icon: ClipboardCheck },
    { to: "/low-stock", label: "Low Stock Alerts", icon: AlertTriangle },
    { to: "/profile", label: "Profile", icon: User },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: Home },
    { to: "/items", label: "Items", icon: Boxes },
    { to: "/suppliers", label: "Suppliers", icon: Truck },
    { to: "/transactions", label: "Transactions", icon: ClipboardList },
    { to: "/item-requests", label: "Item Requests", icon: ClipboardCheck },
    { to: "/reports", label: "Reports", icon: FileBarChart2 },
    { to: "/profile", label: "Profile", icon: User },
  ],
  super_admin: [
    { to: "/super-admin", label: "Dashboard", icon: Home },
    { to: "/items", label: "Items", icon: Boxes },
    { to: "/suppliers", label: "Suppliers", icon: Truck },
    { to: "/transactions", label: "Transactions", icon: ClipboardList },
    { to: "/item-requests", label: "Item Requests", icon: ClipboardCheck },
    { to: "/reports", label: "Reports", icon: FileBarChart2 },
    { to: "/users", label: "User Management", icon: Users },
    { to: "/audit-logs", label: "Audit Logs", icon: Shield },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/profile", label: "Profile", icon: User },
  ],
};

export default function Sidebar({ role, closeOnNavigate }) {
  const location = useLocation();
  const navItems = navConfig[role] || [];
  const [iconsOnly, setIconsOnly] = useState(false);

  return (
    <aside
      className={`flex min-h-full w-72 self-stretch flex-col border-r border-white/60 bg-white/75 p-4 backdrop-blur md:sticky md:top-20 md:h-[calc(100svh-6rem)] md:overflow-y-auto md:transition-[width] md:duration-200 ${
        iconsOnly ? "md:w-20" : "md:w-72"
      }`}
    >
      <div className="mb-6 flex items-start justify-between gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-500 p-4 text-white">
        <div className={iconsOnly ? "md:hidden" : ""}>
          <p className="text-xs uppercase tracking-wide">CSE12202</p>
          <h2 className="mt-1 text-lg font-bold">Smart Inventory</h2>
          <p className="text-xs opacity-90">Warehouse Intelligence Panel</p>
        </div>
        <button
          type="button"
          onClick={() => setIconsOnly((v) => !v)}
          className="hidden rounded-lg border border-white/30 bg-white/10 p-1.5 text-white/95 transition hover:bg-white/20 md:inline-flex"
          title={iconsOnly ? "Expand sidebar" : "Collapse to icons"}
          aria-label={iconsOnly ? "Expand sidebar" : "Collapse to icons"}
        >
          {iconsOnly ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeOnNavigate}
              title={item.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-brand-100 text-brand-700" : "text-ink-600 hover:bg-ink-100"
              } ${
                iconsOnly ? "md:justify-center md:px-2" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className={iconsOnly ? "md:hidden" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={`mt-6 rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-brand-700 ${iconsOnly ? "md:px-2" : ""}`}>
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="h-4 w-4" />
          <span className={iconsOnly ? "md:hidden" : ""}>Live Warehouse Monitor</span>
        </div>
        <p className={`mt-1 ${iconsOnly ? "md:hidden" : ""}`}>Track incoming and outgoing stock in real-time with role-driven controls.</p>
      </div>
    </aside>
  );
}
