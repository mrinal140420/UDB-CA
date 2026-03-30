import { Box } from "lucide-react";

export default function EmptyState({ title = "No data found", message = "Try adjusting filters or add new records.", icon = null }) {
  return (
    <div className="panel flex flex-col items-center justify-center p-8 text-center">
      {icon || <Box className="mb-3 h-10 w-10 text-ink-300" />}
      <h3 className="text-lg font-semibold text-ink-700">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{message}</p>
    </div>
  );
}
