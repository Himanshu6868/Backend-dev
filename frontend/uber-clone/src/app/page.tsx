import { ApiDashboard } from "@/components/api-dashboard";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Ride ready
        </p>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              A friendlier Uber-style experience for riders and captains.
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in as a rider or captain, request a trip, and preview the
              live ride flow in a polished interface inspired by modern ride
              sharing apps.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
              >
                Log in
              </a>
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Create account
              </a>
              <a
                href="/ride"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Explore ride flow
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Live preview
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Online
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-secondary/70 p-4">
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="text-base font-semibold">
                  Indiranagar Metro Station
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/70 p-4">
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="text-base font-semibold">MG Road</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">
                    Arriving
                  </p>
                  <p className="text-lg font-semibold">3 mins</p>
                </div>
                <p className="text-base font-semibold">₹168</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Rider-first booking",
            description:
              "Clean pickup and destination inputs with quick ride options and realtime confirmations.",
          },
          {
            title: "Captain console",
            description:
              "A focused panel showing nearby rides, earnings, and quick accept actions.",
          },
          {
            title: "Trip in progress",
            description:
              "Visual status updates for pickup, arrival, and drop-off just like popular ride apps.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
