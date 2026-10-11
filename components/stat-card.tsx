import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card className="group relative overflow-hidden gap-0 p-5 transition-all hover:border-primary/40 shadow-2xs">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-mono font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <span className="grid size-8 place-items-center rounded-lg border border-border/80 bg-muted/30 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
          {icon}
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <p className="font-display text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {trend && (
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400 font-medium">
            {trend}
          </span>
        )}
      </div>

      {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}
