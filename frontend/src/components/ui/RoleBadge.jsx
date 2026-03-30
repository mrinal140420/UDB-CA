const colors = {
  worker: "bg-sky-100 text-sky-700",
  admin: "bg-amber-100 text-amber-700",
  super_admin: "bg-rose-100 text-rose-700",
};

const labels = {
  worker: "Worker",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function RoleBadge({ role }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[role] || "bg-gray-100 text-gray-600"}`}>
      {labels[role] || role}
    </span>
  );
}
