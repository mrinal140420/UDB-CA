import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Boxes, ShieldCheck, TrendingUp, Warehouse } from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";

const schema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const roleHome = {
  worker: "/worker",
  admin: "/admin",
  super_admin: "/super-admin",
};

const teamMembers = [
  {
    name: "MRINAL SAHOO",
    regNo: "AU/2023/0009869",
    rollNo: "UG/02/BTCSECSF/2023/023",
    department: "CSE-CSF",
    group: "Group 12",
  },
  {
    name: "RITUPAN DAIMARY",
    regNo: "AU/2023/0009936",
    rollNo: "UG/02/BTCSECSF/2023/022",
    department: "CSE-CSF",
    group: "Group 12",
  },
  {
    name: "SUBHANGKAR BARUI",
    regNo: "AU/2023/0010103",
    rollNo: "UG/02/BTCSECSF/2023/021",
    department: "CSE-CSF",
    group: "Group 12",
  },
  {
    name: "CHAYAN DAS",
    regNo: "AU/2023/0009869",
    rollNo: "UG/02/BTCSECSF/2023/020",
    department: "CSE-CSF",
    group: "Group 12",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    const result = await login(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    const role = useAuthStore.getState().user?.role;
    toast.success("Welcome to Smart Inventory Dashboard");
    navigate(roleHome[role] || "/worker");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto grid min-h-screen max-w-[1380px] grid-cols-1 items-stretch gap-6 px-4 py-6 lg:grid-cols-5 lg:gap-8 lg:px-8 lg:py-8">
        <section className="animate-fade-in relative min-h-[calc(100svh-3rem)] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 p-6 text-white shadow-2xl lg:col-span-3 lg:min-h-[calc(100svh-4rem)] lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-14 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

          <div className="relative z-10">
            <p className="w-max rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest">
              CSE12202 | Unstructured Database Lab
            </p>

            <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Smart Inventory & Warehouse Management System
            </h1>

            <div className="mt-5 rounded-2xl border border-white/25 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/85">
                Project Team
              </p>

              <div className="mt-4 space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.rollNo}
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-3"
                  >
                    <div className="grid grid-cols-1 gap-y-2 text-xs sm:text-sm md:grid-cols-[1.3fr_1.1fr_1.5fr_0.9fr_0.8fr] md:gap-x-4 md:gap-y-0">
                      <p className="min-w-0 font-semibold break-words">
                        {member.name}
                      </p>
                      <p className="min-w-0 break-words text-white/90">
                        {member.regNo}
                      </p>
                      <p className="min-w-0 break-words text-white/90">
                        {member.rollNo}
                      </p>
                      <p className="min-w-0 break-words text-white/85">
                        {member.department}
                      </p>
                      <p className="min-w-0 break-words font-medium text-white/90">
                        {member.group}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Boxes className="h-4 w-4" />
                  Inventory & Stock Control
                </div>
                <p className="mt-1 text-xs text-white/80">
                  Track items, suppliers, and stock movement with audit-ready records.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  Aggregation Analytics
                </div>
                <p className="mt-1 text-xs text-white/80">
                  Low stock, total inventory value, movement, and role-based insights.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  RBAC Security
                </div>
                <p className="mt-1 text-xs text-white/80">
                  Worker, Admin, Super Admin with strict backend route authorization.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Warehouse className="h-4 w-4" />
                  Demo-Ready UX
                </div>
                <p className="mt-1 text-xs text-white/80">
                  Responsive dashboards and polished visuals for documentation screenshots.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 rounded-2xl border border-white/25 bg-white/10 p-4 text-xs text-white/90 md:grid-cols-3">
              <div>
                <p className="font-semibold">Worker</p>
                <p className="text-white/80">
                  Operations dashboard, stock in/out, low stock alerts
                </p>
              </div>

              <div>
                <p className="font-semibold">Admin</p>
                <p className="text-white/80">
                  Manage items/suppliers and monitor reports
                </p>
              </div>

              <div>
                <p className="font-semibold">Super Admin</p>
                <p className="text-white/80">
                  User control, audit logs, full platform analytics
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center lg:col-span-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="panel animate-rise-up w-full max-w-md p-6 md:p-7"
          >
            <h2 className="text-2xl font-bold text-ink-900">Sign In</h2>
            <p className="mt-1 text-sm text-ink-500">
              Use your role-based demo credentials.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  {...register("email")}
                  placeholder="name@demo.com"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 outline-none transition focus:border-brand-500"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="password"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 outline-none transition focus:border-brand-500"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button disabled={isLoading} className="btn-primary mt-6 w-full">
              {isLoading ? "Signing In..." : "Login"}
            </button>

           
          </form>
        </section>
      </div>
    </div>
  );
}