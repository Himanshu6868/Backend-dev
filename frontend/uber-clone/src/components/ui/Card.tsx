import clsx from "clsx";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-black/10 bg-white/85 p-6 shadow-[0_12px_34px_rgba(17,17,17,0.08)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
