import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get("/audit-logs")
      .then((res) => setRows(res.data.data.logs))
      .catch((error) => {
        if (error?.response?.status !== 401) {
          toast.error("Failed to load audit logs");
        }
      });
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Audit Logs" subtitle="System activity timeline for governance and role-based actions" />
      <DataTable
        columns={[
          { key: "timestamp", label: "Time", render: (r) => new Date(r.timestamp).toLocaleString() },
          { key: "user_name", label: "User" },
          { key: "role", label: "Role" },
          { key: "action", label: "Action" },
          { key: "module", label: "Module" },
          { key: "target_id", label: "Target" },
          { key: "details", label: "Details" },
        ]}
        rows={rows}
      />
    </div>
  );
}
