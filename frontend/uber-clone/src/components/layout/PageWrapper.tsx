import { ReactNode } from "react";

export function PageWrapper({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`min-h-screen bg-[#fafafa] text-[#111111] antialiased ${className}`}>
      <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500">{children}</div>
    </main>
  );
}
