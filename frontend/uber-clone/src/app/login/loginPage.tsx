"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, apiRoutes } from "@/lib/api";
import { setSessionRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      // Persist auth
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
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Choose your role to unlock the rider or captain experience.
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <a href="/register">Sign Up</a>
          </Button>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label>Select role</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["rider", "captain"] as Role[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${role === item
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full">
            {isSubmitting ? "Logging in..." : `Log in as ${role}`}
          </Button>
          {status ? (
            <div className="w-full rounded-xl border border-border bg-muted/60 p-4 text-sm text-foreground">
              <p className="font-semibold">{status}</p>
            </div>
          ) : null}
        </CardFooter>
      </form>
    </Card>
  );
}
