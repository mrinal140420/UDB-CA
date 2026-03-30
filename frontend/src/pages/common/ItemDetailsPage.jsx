import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import StockBadge from "../../components/ui/StockBadge";
import { formatINR } from "../../utils/currency";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/items/${id}`).then((res) => setItem(res.data.data.item));
  }, [id]);

  if (!item) return <div className="panel p-6">Loading item details...</div>;

  return (
    <div>
      <PageHeader title="Item Details" subtitle="Complete inventory and supplier information" />
      <div className="panel p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Item ID</p>
            <p className="font-semibold">{item.item_id}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Name</p>
            <p className="font-semibold">{item.name}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Category</p>
            <p className="font-semibold">{item.category}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Quantity</p>
            <p className="font-semibold">{item.quantity}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Reorder Level</p>
            <p className="font-semibold">{item.reorder_level}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Stock Status</p>
            <StockBadge quantity={item.quantity} reorderLevel={item.reorder_level} />
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Price</p>
            <p className="font-semibold">{formatINR(item.price)}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Supplier</p>
            <p className="font-semibold">{item.supplier_id?.name}</p>
          </div>
          <div className="rounded-xl bg-ink-100 p-3">
            <p className="text-xs text-ink-500">Location</p>
            <p className="font-semibold">{item.warehouse_location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
