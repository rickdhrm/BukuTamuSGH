import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-800/60", className)}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 py-3 px-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/40">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="space-y-1 flex-1 max-w-xs">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-28 hidden sm:block" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
