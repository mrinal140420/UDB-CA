import EmptyState from "./EmptyState";

export default function DataTable({ columns, rows, actions, pagination, onPageChange }) {
  if (!rows?.length) return <EmptyState />;

  return (
    <div className="panel animate-rise-up overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-100/70 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold">
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row._id || idx} className="border-t border-ink-100 transition-colors hover:bg-ink-100/35">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-ink-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && <td className="px-4 py-3">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
          <span>
            Page {pagination.page} of {pagination.pages || 1}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary py-1 text-xs"
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
            >
              Prev
            </button>
            <button
              className="btn-secondary py-1 text-xs"
              onClick={() => onPageChange(Math.min(pagination.pages || 1, pagination.page + 1))}
              disabled={pagination.page >= (pagination.pages || 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
