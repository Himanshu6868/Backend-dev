"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, apiRoutes } from "@/lib/api";
import { setSessionRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    setStatus(
      role === "rider"
        ? "Creating your rider account..."
        : "Creating your captain account..."
    );
    try {
      const response = await apiRequest(
        role === "rider" ? apiRoutes.registerUser : apiRoutes.registerCaptain,
        {
          method: "POST",
          body: payload,
        }
      );
      setSessionRole(role);
      setComplete(true);
      setStatus(
        typeof response === "string"
          ? response
          : `Account created for ${role}.`
      );
      router.replace(role === "rider" ? "/ride" : "/captain");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registration failed");
      setComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-12 lg:flex-row">
        <div className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            New here?
          </p>
          <h1 className="text-4xl font-semibold">
            Create your rider or captain account.
          </h1>
          <p className="text-lg text-muted-foreground">
            Join the fleet with a profile that unlocks smart routing, flexible
            payments, and trip tracking in one place.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Instant ride confirmations",
              "Live captain availability",
              "Secure in-app payments",
              "Trip history & receipts",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Complete your profile to get started.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label>Select role</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["rider", "captain"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRole(item)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          role === item
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-accent"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                          {item === "rider" ? "Rider" : "Captain"}
                        </p>
                        <p className="mt-1 text-base">
                          {item === "rider"
                            ? "Book rides faster"
                            : "Accept nearby trips"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" placeholder="Ayesha Khan" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ayesha@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" name="phone" placeholder="+91 98765 43210" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
              {status ? (
                <div className="w-full rounded-xl border border-border bg-muted/60 p-4 text-sm">
                  <p className="font-semibold">{status}</p>
                </div>
              ) : null}
              {complete ? (
                <div className="w-full rounded-xl border border-border bg-muted/60 p-4 text-sm">
                  <p className="font-semibold">Account created!</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You can now log in and start booking or accepting rides.
                  </p>
                  <Button asChild className="mt-3 w-full">
                    <a href="/login">Go to login</a>
                  </Button>
                </div>
              ) : null}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
