import * as React from "react";

function Label({ className = "", ...props }: React.ComponentProps<"label">) {
  return <label className={`text-sm font-medium text-black/80 ${className}`} {...props} />;
}

export { Label };
