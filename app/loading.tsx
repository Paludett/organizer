const columns = [
  { status: "todo", label: "A fazer" },
  { status: "doing", label: "Em andamento" },
  { status: "done", label: "Concluído" },
] as const;

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">Organizer</h1>
        <div className="h-8 w-40 animate-pulse rounded-md bg-border" />
      </div>

      <div className="h-24 animate-pulse rounded-lg border border-border bg-card" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-2 min-h-24">
              <div className="h-16 animate-pulse rounded-lg border border-border bg-card" />
              <div className="h-16 animate-pulse rounded-lg border border-border bg-card" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
