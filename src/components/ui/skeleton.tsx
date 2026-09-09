import { cn } from "@/lib/utils";

/**
 * Skeleton loading placeholder primitive.
 * Usage: <Skeleton className="h-4 w-24" />
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading..."
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40",
        className
      )}
    />
  );
}

/** Pre-composed card skeleton for book catalog cards */
export function BookCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
    </div>
  );
}

/** Pre-composed row skeleton for data tables */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default Skeleton;
