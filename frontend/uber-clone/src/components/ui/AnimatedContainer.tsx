import clsx from "clsx";
import { HTMLAttributes } from "react";

export function AnimatedContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
        className
      )}
      {...props}
    />
  );
}
