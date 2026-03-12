"use client";

import { useState } from "react";
import { Bike, CarTaxiFront, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest, apiRoutes } from "@/lib/api";
import { setSessionRole } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Role = "rider" | "captain";

export function CardDemo() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("rider");
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    setIsSubmitting(true);
    setStatus(role === "rider" ? "Logging in as rider..." : "Logging in as captain...");

    try {
      const response = await apiRequest(
        role === "rider" ? apiRoutes.loginUser : apiRoutes.loginCaptain,
        {
          method: "POST",
          body: payload,
        }
      );

      const { token } = response as { token: string };

      if (!token) {
        throw new Error("Authentication token missing");
      }

      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      setSessionRole(role);
      setStatus(`Logged in successfully as ${role}.`);
      router.push(role === "rider" ? "/ride" : "/captain");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg bg-white/90">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-sm text-black/60">Choose your role and continue your trip workflow.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Select role">
          {(["rider", "captain"] as Role[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                role === item
                  ? "border-[#6366f1] bg-indigo-50 shadow-sm"
                  : "border-black/10 bg-white hover:-translate-y-0.5"
              }`}
            >
              <div className="mb-2 inline-flex rounded-lg bg-black/5 p-2">
                {item === "rider" ? <Bike className="h-4 w-4" /> : <CarTaxiFront className="h-4 w-4" />}
              </div>
              <p className="text-sm font-semibold capitalize">{item}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required className="focus-visible:ring-2 focus-visible:ring-[#6366f1]/40" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required className="focus-visible:ring-2 focus-visible:ring-[#6366f1]/40" />
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting} icon={<ShieldCheck className="h-4 w-4" />}>
          {isSubmitting ? "Authenticating..." : `Log in as ${role}`}
        </Button>

        {status ? (
          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-4 text-sm">
            <StatusBadge label={status} tone={status.toLowerCase().includes("failed") ? "danger" : "info"} />
          </div>
        ) : null}

        <p className="text-center text-sm text-black/60">
          New here? <a href="/register" className="font-semibold text-[#6366f1]">Create account</a>
        </p>
      </form>
    </Card>
  );
}
