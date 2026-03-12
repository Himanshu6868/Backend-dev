import clsx from "clsx";

type StatusBadgeProps = {
  label: string;
  tone?: "info" | "success" | "warning" | "danger";
};

const toneMap = {
  info: "bg-indigo-50 text-indigo-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-600",
};

export function StatusBadge({ label, tone = "info" }: StatusBadgeProps) {
  return (
    <span className={clsx("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", toneMap[tone])}>
      <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
      {label}
    </span>
  );
}
