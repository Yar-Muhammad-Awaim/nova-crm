import { Card } from "@/components/ui/card";

export function StatCard({
  label, value, sub, icon,
}: { label: string; value: React.ReactNode; sub?: string; icon: React.ReactNode }) {
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <span className="text-muted-foreground/70">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}
