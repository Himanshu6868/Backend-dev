import * as React from "react";
import clsx from "clsx";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={clsx(
        "h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm shadow-sm outline-none placeholder:text-black/40 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export { Input };
