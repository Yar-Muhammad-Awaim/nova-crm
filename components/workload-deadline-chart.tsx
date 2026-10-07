import { Card } from "@/components/ui/card";
import { taskStatus } from "@/lib/task-board";
import type { Task } from "@/lib/types";

const dayMs = 86_400_000;
const chartWidth = 800;
const chartHeight = 190;
const chartLeft = 14;
const chartRight = chartWidth - 14;
const chartTop = 14;
const chartBottom = chartHeight - 14;

function dateLabel(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(timestamp);
}

function hoursLabel(hours: number) {
  return `${hours.toLocaleString("en-US", { maximumFractionDigits: 2 })}h`;
}

export function WorkloadDeadlineChart({ tasks }: { tasks: Task[] }) {
  const openTasks = tasks
    .filter((task) => taskStatus(task) !== "done")
    .map((task) => ({
      due: Date.parse(`${task.deadline}T00:00:00Z`),
      hours: Number(task.estimated_hours),
    }))
    .filter((task) => Number.isFinite(task.due));

  if (openTasks.length === 0) {
    return (
      <Card className="gap-0 px-5 py-6 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight">Open hours by deadline</h2>
        <p className="mt-2 text-sm text-muted-foreground">No unfinished tasks have a due date.</p>
      </Card>
    );
  }

  const first = Math.min(...openTasks.map((task) => task.due));
  const last = Math.max(...openTasks.map((task) => task.due));
  const spanDays = Math.round((last - first) / dayMs) + 1;
  const periodDays = spanDays <= 21 ? 1 : spanDays <= 84 ? 7 : Math.ceil(spanDays / 12);
  const bucketCount = Math.max(2, Math.ceil(spanDays / periodDays));
  const values = Array.from({ length: bucketCount }, () => 0);
  for (const task of openTasks) {
    const index = Math.floor((task.due - first) / (dayMs * periodDays));
    values[index] += task.hours;
  }

  const peak = Math.max(...values);
  const peakDate = dateLabel(first + values.indexOf(peak) * periodDays * dayMs);
  const ceiling = Math.max(1, Math.ceil(peak / 5) * 5);
  const points = values.map((hours, index) => ({
    x: chartLeft + (index / (values.length - 1)) * (chartRight - chartLeft),
    y: chartBottom - (hours / ceiling) * (chartBottom - chartTop),
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${line} L ${chartRight} ${chartBottom} L ${chartLeft} ${chartBottom} Z`;
  const tickIndices = [...new Set([0, 0.25, 0.5, 0.75, 1]
    .map((fraction) => Math.round(fraction * (bucketCount - 1))))];
  const bucketDate = (index: number) => first + index * periodDays * dayMs;
  const description = values.map((hours, index) =>
    `${dateLabel(bucketDate(index))}: ${hoursLabel(hours)}`
  ).join(", ");

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Open hours by deadline</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated effort due {periodDays === 1 ? "each day" : `in ${periodDays}-day periods`}; completed tasks are excluded.
          </p>
        </div>
        <div className="inline-flex items-center gap-2.5 self-start whitespace-nowrap rounded-lg border bg-background px-3 py-2">
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Peak due {peakDate}</span>
          <span className="border-l pl-2.5 text-sm font-semibold tabular-nums">{hoursLabel(peak)}</span>
        </div>
      </div>
      <div className="px-5 pb-5 pt-6 sm:px-6">
        <div className="flex gap-3">
          <div className="flex w-9 shrink-0 flex-col justify-between py-1 text-[11px] tabular-nums text-muted-foreground">
            <span>{hoursLabel(ceiling)}</span>
            <span>{hoursLabel(ceiling / 2)}</span>
            <span>0h</span>
          </div>
          <div
            className="relative h-56 min-w-0 flex-1 sm:h-64 lg:h-80"
            role="img"
            aria-label={`Open estimated hours by due date. ${description}`}
          >
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="workload-deadline-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {[chartTop, (chartTop + chartBottom) / 2, chartBottom].map((y) => (
                <line key={y} x1={chartLeft} x2={chartRight} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={area} fill="url(#workload-deadline-fill)" />
              <path d={line} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {points.map((point, index) => (
              <span
                key={index}
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-card"
                style={{ left: `${(point.x / chartWidth) * 100}%`, top: `${(point.y / chartHeight) * 100}%` }}
                title={`${dateLabel(bucketDate(index))}: ${hoursLabel(values[index])}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <div className="relative ml-12 mt-2 h-4 text-[11px] tabular-nums text-muted-foreground">
          {tickIndices.map((index) => (
            <span
              key={index}
              className="absolute whitespace-nowrap"
              style={{
                left: `${(index / (bucketCount - 1)) * 100}%`,
                transform: index === 0 ? undefined : index === bucketCount - 1 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {dateLabel(bucketDate(index))}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
