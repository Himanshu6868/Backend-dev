import { CarFront, LayoutDashboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/home" className="inline-flex items-center gap-2 text-lg font-bold text-[#111111]">
          <CarFront className="h-5 w-5 text-[#84cc16]" />
          RideFlow
        </a>
        <div className="hidden items-center gap-2 sm:flex">
          <Button href="/home" variant="ghost" className="h-9 px-4">Home</Button>
          <Button href="/home#features" variant="ghost" className="h-9 px-4">Features</Button>
          <Button href="/ride" variant="secondary" className="h-9 px-4" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</Button>
        </div>
        <Sparkles className="h-5 w-5 text-[#84cc16] sm:hidden" aria-hidden />
      </nav>
    </header>
  );
}
