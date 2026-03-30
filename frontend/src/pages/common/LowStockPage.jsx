import { useEffect, useState } from "react";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StockBadge from "../../components/ui/StockBadge";

export default function LowStockPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/reports/low-stock").then((res) => setRows(res.data.data.lowStock));
  }, []);

  return (
    <div>
      <PageHeader title="Low Stock Alerts" subtitle="Items where quantity is below reorder level" />
      <DataTable
        columns={[
          { key: "item_id", label: "Item Code" },
          { key: "name", label: "Item" },
          { key: "category", label: "Category" },
          { key: "quantity", label: "Qty" },
          { key: "reorder_level", label: "Reorder" },
          { key: "supplier", label: "Supplier" },
          { key: "warehouse_location", label: "Location" },
          { key: "status", label: "Stock", render: (r) => <StockBadge quantity={r.quantity} reorderLevel={r.reorder_level} /> },
        ]}
        rows={rows}
      />
    </div>
  );
}
