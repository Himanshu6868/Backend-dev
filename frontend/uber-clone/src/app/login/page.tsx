import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CardDemo } from "./loginPage";

export default function LoginPage() {
  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6366f1]">Secure access</p>
          <h1 className="text-4xl font-bold">Sign in and keep rides moving.</h1>
          <p className="text-black/70">Switch between rider and captain modes with a refined, responsive interface.</p>
          <div className="rounded-2xl border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur">
            <p className="font-semibold">One account, two experiences.</p>
            <p className="mt-2 text-sm text-black/60">Book rides as a rider or accept requests as a captain—without changing backend flows.</p>
          </div>
        </section>
        <CardDemo />
      </div>
    </PageWrapper>
  );
}
