"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, apiRoutes } from "@/lib/api";
import { setSessionRole } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [complete, setComplete] = useState(false);
  const [role, setRole] = useState<"rider" | "captain">("rider");
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    setIsSubmitting(true);
    setStatus(role === "rider" ? "Creating your rider account..." : "Creating your captain account...");
    try {
      const response = await apiRequest(role === "rider" ? apiRoutes.registerUser : apiRoutes.registerCaptain, {
        method: "POST",
        body: payload,
      });
      setSessionRole(role);
      setComplete(true);
      setStatus(typeof response === "string" ? response : `Account created for ${role}.`);
      router.replace(role === "rider" ? "/ride" : "/captain");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registration failed");
      setComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6366f1]">Create account</p>
          <h1 className="text-4xl font-bold">Join RideFlow in under a minute.</h1>
          <ol className="space-y-3 rounded-2xl border border-black/10 bg-white/75 p-5 text-sm">
            <li><span className="font-semibold">1.</span> Choose rider or captain role.</li>
            <li><span className="font-semibold">2.</span> Add profile credentials.</li>
            <li><span className="font-semibold">3.</span> Start booking or accepting rides.</li>
          </ol>
        </section>

        <Card className="w-full max-w-lg bg-white/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Sign up</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["rider", "captain"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={`rounded-xl border p-3 text-left transition ${
                    role === item ? "border-[#6366f1] bg-indigo-50" : "border-black/10 bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold capitalize">{item}</p>
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Ayesha Khan" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="ayesha@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="Create a strong password" />
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</Button>
            {status ? <p className="rounded-xl bg-black/5 p-3 text-sm">{status}</p> : null}
            {complete ? <a href="/login" className="block text-center text-sm font-semibold text-[#6366f1]">Go to login</a> : null}
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
