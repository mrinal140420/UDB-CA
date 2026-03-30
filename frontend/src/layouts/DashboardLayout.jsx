import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useAuthStore } from "../context/useAuthStore";

export default function DashboardLayout() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Topbar onMenu={() => setOpen(true)} />
      <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-[1400px] items-stretch">
        <div className="hidden self-stretch md:flex">
          <Sidebar role={user?.role} />
        </div>
        {open && (
          <div className="fixed inset-0 z-30 flex md:hidden">
            <div className="w-72">
              <Sidebar role={user?.role} closeOnNavigate={() => setOpen(false)} />
            </div>
            <button className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
          </div>
        )}
        <main className="w-full p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
