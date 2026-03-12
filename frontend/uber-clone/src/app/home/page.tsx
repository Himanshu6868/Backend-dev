import { ArrowRight, Bolt, CarTaxiFront, CreditCard, History, Leaf, MapPin, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  { title: "Instant ride booking", description: "Tap once and get matched in seconds.", icon: Bolt },
  { title: "Real-time captain matching", description: "Track driver movement live on your route.", icon: MapPin },
  { title: "Secure payments", description: "Card, wallet, or UPI with encrypted checkout.", icon: CreditCard },
  { title: "Ride history", description: "All rides and invoices organized in one place.", icon: History },
];

const stats = [
  { label: "Active riders", value: "100K+" },
  { label: "Daily trips", value: "45K+" },
  { label: "Average ETA", value: "3.2 min" },
];

export default function LandingPage() {
  return (
    <PageWrapper className="bg-[#f4f8ea]">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-8 h-56 w-56 animate-pulse rounded-full bg-[#84cc16]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-64 w-64 animate-pulse rounded-full bg-[#22c55e]/20 blur-3xl [animation-delay:250ms]" />

        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <AnimatedContainer className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#d9f99d] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#3f6212]">
              <Leaf className="h-3.5 w-3.5" />
              Smarter mobility experience
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#1f2937] sm:text-5xl lg:text-6xl">
                Together, We Move
                <span className="block text-[#65a30d]">Your City Forward.</span>
              </h1>
              <p className="max-w-xl text-base text-black/70 sm:text-lg">
                A professional rider and captain platform with cleaner design, real-time matching,
                and a frictionless ride workflow from booking to drop-off.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href="/ride" variant="secondary" className="bg-[#65a30d] hover:bg-[#4d7c0f]">
                Open Dashboard
              </Button>
              <Button href="#features" variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>
                Explore features
              </Button>
            </div>

            <div className="grid max-w-xl gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <Card key={item.label} className="border-[#bef264]/60 bg-white/80 px-4 py-4">
                  <p className="text-2xl font-bold text-[#3f6212]">{item.value}</p>
                  <p className="text-xs uppercase tracking-wider text-black/60">{item.label}</p>
                </Card>
              ))}
            </div>
          </AnimatedContainer>

          <AnimatedContainer className="relative">
            <Card className="relative overflow-hidden border-[#a3e635]/70 bg-gradient-to-br from-[#ecfccb] via-[#f7fee7] to-[#d9f99d]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#65a30d]/20 blur-2xl" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/55">Live operations</p>

              <div className="mt-4 rounded-2xl border border-[#84cc16]/30 bg-white/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Current status</p>
                    <p className="text-xl font-bold text-[#3f6212]">26 captains nearby</p>
                  </div>
                  <CarTaxiFront className="h-8 w-8 text-[#65a30d]" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-white/85 p-3">
                  <p className="text-sm font-semibold">Airport drop in progress</p>
                  <p className="text-xs text-black/65">Captain Omar • ETA 6 min</p>
                </div>
                <div className="rounded-xl bg-white/85 p-3">
                  <p className="text-sm font-semibold">Office pickup queued</p>
                  <p className="text-xs text-black/65">Captain Nora • Confirming route</p>
                </div>
              </div>
            </Card>
          </AnimatedContainer>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#65a30d]">Platform benefits</p>
            <h2 className="text-3xl font-bold text-[#1f2937]">Built for riders and captains</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <AnimatedContainer key={title}>
              <Card className="h-full border-[#d9f99d] transition-all duration-300 hover:-translate-y-1 hover:border-[#84cc16] hover:shadow-[0_16px_35px_rgba(101,163,13,0.18)]">
                <Icon className="h-5 w-5 text-[#65a30d]" />
                <p className="mt-4 font-semibold">{title}</p>
                <p className="mt-2 text-sm text-black/65">{description}</p>
              </Card>
            </AnimatedContainer>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Card className="flex flex-col items-start justify-between gap-5 border-[#1f2937] bg-[#1f2937] text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Your next ride is just one tap away</h2>
            <p className="mt-2 text-white/80">Protected access, cleaner UI, and a more premium trip experience.</p>
          </div>
          <Button href="/ride" variant="secondary" className="bg-[#84cc16] text-[#1f2937] hover:bg-[#a3e635]">
            Continue to dashboard
          </Button>
        </Card>
      </section>

      <section className="pb-12">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 text-sm text-black/55">
          <ShieldCheck className="h-4 w-4 text-[#65a30d]" />
          Home is protected and accessible only for authenticated sessions.
        </div>
      </section>
    </PageWrapper>
  );
}
