import Link from "next/link";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  loading?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "success" | "danger";
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[#111111] text-white hover:bg-[#111111]/90",
  secondary: "bg-[#6366f1] text-white hover:bg-[#6366f1]/90",
  ghost: "bg-white/70 text-[#111111] hover:bg-white border border-black/10",
  success: "bg-emerald-500 text-white hover:bg-emerald-600",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

export function Button({
  children,
  className,
  href,
  loading,
  disabled,
  icon,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = clsx(
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/40 disabled:cursor-not-allowed disabled:opacity-60",
    variantStyles[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
