"use client";

import { useState } from "react";
import { apiRequest, apiRoutes, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RequestState = { status: "idle" | "loading" | "success" | "error"; message: string };
const initialState: RequestState = { status: "idle", message: "" };

function formatPayload(payload: unknown) {
  return typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
}

export function ApiDashboard() {
  const [registerState, setRegisterState] = useState<RequestState>(initialState);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    setRegisterState({ status: "loading", message: "Registering..." });
    try {
      const response = await apiRequest(apiRoutes.registerUser, { method: "POST", body: payload });
      setRegisterState({ status: "success", message: formatPayload(response) });
      event.currentTarget.reset();
    } catch (error) {
      setRegisterState({ status: "error", message: error instanceof Error ? error.message : "Registration failed" });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <p className="text-sm text-black/60">API Base: {API_BASE_URL}</p>
      <Card>
        <h2 className="text-xl font-semibold">Quick API Smoke Test</h2>
        <form className="mt-4 space-y-3" onSubmit={handleRegister}>
          <div>
            <Label htmlFor="register-name">Name</Label>
            <Input id="register-name" name="name" required />
          </div>
          <div>
            <Label htmlFor="register-email">Email</Label>
            <Input id="register-email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="register-password">Password</Label>
            <Input id="register-password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">Register</Button>
          {registerState.message ? <pre className="rounded-xl bg-black/5 p-3 text-xs">{registerState.message}</pre> : null}
        </form>
      </Card>
    </div>
  );
}
