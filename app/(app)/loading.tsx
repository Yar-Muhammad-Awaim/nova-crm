import { Skeleton } from "@/components/ui/skeleton";

/** Shaped like the real page so nothing jumps when the content lands. */
export default function Loading() {
  return (
    <div>
      <div className="border-b px-6 py-7 lg:px-9">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-7 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-8 px-6 py-7 lg:px-9">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
