import { Bolt, CreditCard, History, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  { title: "Instant ride booking", icon: Bolt },
  { title: "Real-time captain matching", icon: MapPin },
  { title: "Secure payments", icon: CreditCard },
  { title: "Ride history", icon: History },
];

export default function LandingPage() {
  return (
    <PageWrapper>
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(17,17,17,0.15),transparent_35%)]" />
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <AnimatedContainer className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6366f1]">Modern mobility platform</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ride Smarter. Move Faster.</h1>
            <p className="max-w-xl text-base text-black/70 sm:text-lg">Book rides in seconds, get matched with nearby captains in real time, and track each trip through a cleaner, faster interface.</p>
            <div className="flex flex-wrap gap-3">
              <Button href="/login">Book a Ride</Button>
              <Button href="/login" variant="secondary">Become a Captain</Button>
            </div>
          </AnimatedContainer>
          <Card className="h-full bg-white/65">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">How it works</p>
              {["Request ride", "Captain accepts", "Trip starts"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg bg-white/85 p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6366f1] text-xs font-semibold text-white">{index + 1}</span>
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, icon: Icon }) => (
            <AnimatedContainer key={title}>
              <Card className="h-full transition-transform duration-200 hover:-translate-y-1">
                <Icon className="h-5 w-5 text-[#6366f1]" />
                <p className="mt-4 font-semibold">{title}</p>
              </Card>
            </AnimatedContainer>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Card className="flex flex-col items-start justify-between gap-5 bg-[#111111] text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Start your next trip with RideFlow</h2>
            <p className="mt-2 text-white/80">Fast booking for riders, efficient matching for captains.</p>
          </div>
          <Button href="/login" variant="secondary">Get Started</Button>
        </Card>
      </section>
    </PageWrapper>
  );
}
