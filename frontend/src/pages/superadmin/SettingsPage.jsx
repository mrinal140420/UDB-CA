import PageHeader from "../../components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="System Settings" subtitle="Global controls for platform-level configuration" />
      <div className="panel animate-rise-up stagger-children grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <div className="rounded-xl border border-ink-200 p-4 transition hover:bg-ink-100/40">
          <h3 className="font-semibold">Rate Limiter</h3>
          <p className="mt-1 text-sm text-ink-500">Configured from backend environment variables for API protection.</p>
        </div>
        <div className="rounded-xl border border-ink-200 p-4 transition hover:bg-ink-100/40">
          <h3 className="font-semibold">Role Policies</h3>
          <p className="mt-1 text-sm text-ink-500">Worker, Admin and Super Admin permissions are enforced at API middleware level.</p>
        </div>
        <div className="rounded-xl border border-ink-200 p-4 transition hover:bg-ink-100/40">
          <h3 className="font-semibold">Audit Monitoring</h3>
          <p className="mt-1 text-sm text-ink-500">All critical actions are traceable from the audit log panel.</p>
        </div>
        <div className="rounded-xl border border-ink-200 p-4 transition hover:bg-ink-100/40">
          <h3 className="font-semibold">Database Performance</h3>
          <p className="mt-1 text-sm text-ink-500">Compound index on transaction item and date supports faster report generation.</p>
        </div>
      </div>
    </div>
  );
}
