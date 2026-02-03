"use client";

import { useState } from "react";
import { apiRequest, apiRoutes, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RequestState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

const initialState: RequestState = { status: "idle", message: "" };

function formatPayload(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }
  return JSON.stringify(payload, null, 2);
}

export function ApiDashboard() {
  const [registerState, setRegisterState] =
    useState<RequestState>(initialState);
  const [loginState, setLoginState] = useState<RequestState>(initialState);
  const [profileState, setProfileState] = useState<RequestState>(initialState);
  const [rideState, setRideState] = useState<RequestState>(initialState);

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
      const response = await apiRequest(apiRoutes.register, {
        method: "POST",
        body: payload,
      });
      setRegisterState({
        status: "success",
        message: formatPayload(response),
      });
      event.currentTarget.reset();
    } catch (error) {
      setRegisterState({
        status: "error",
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    setLoginState({ status: "loading", message: "Logging in..." });
    try {
      const response = await apiRequest(apiRoutes.login, {
        method: "POST",
        body: payload,
      });
      setLoginState({
        status: "success",
        message: formatPayload(response),
      });
      event.currentTarget.reset();
    } catch (error) {
      setLoginState({
        status: "error",
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  const handleProfile = async () => {
    setProfileState({ status: "loading", message: "Fetching profile..." });
    try {
      const response = await apiRequest(apiRoutes.profile, { method: "GET" });
      setProfileState({
        status: "success",
        message: formatPayload(response),
      });
    } catch (error) {
      setProfileState({
        status: "error",
        message: error instanceof Error ? error.message : "Profile failed",
      });
    }
  };

  const handleCreateRide = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      pickup: String(formData.get("pickup") ?? ""),
      destination: String(formData.get("destination") ?? ""),
    };

    setRideState({ status: "loading", message: "Creating ride..." });
    try {
      const response = await apiRequest(apiRoutes.createRide, {
        method: "POST",
        body: payload,
      });
      setRideState({
        status: "success",
        message: formatPayload(response),
      });
      event.currentTarget.reset();
    } catch (error) {
      setRideState({
        status: "error",
        message: error instanceof Error ? error.message : "Ride failed",
      });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Backend connectivity
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          Uber Clone API Console
        </h1>
        <p className="text-sm text-muted-foreground">
          Talking to <span className="font-medium">{API_BASE_URL}</span> via the
          gateway. Use these forms to exercise the auth and ride endpoints.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a user account</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="register-name">Name</Label>
                <Input
                  id="register-name"
                  name="name"
                  placeholder="Jane Rider"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Register
              </Button>
              {registerState.message ? (
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                  {registerState.message}
                </pre>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log in</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Log in
              </Button>
              {loginState.message ? (
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                  {loginState.message}
                </pre>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fetch user profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Requires a valid login cookie from the gateway.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleProfile}
              className="w-full"
            >
              Load profile
            </Button>
            {profileState.message ? (
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                {profileState.message}
              </pre>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create a ride request</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateRide}>
              <div className="space-y-2">
                <Label htmlFor="ride-pickup">Pickup</Label>
                <Input
                  id="ride-pickup"
                  name="pickup"
                  placeholder="Times Square"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ride-destination">Destination</Label>
                <Input
                  id="ride-destination"
                  name="destination"
                  placeholder="Central Park"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Request ride
              </Button>
              {rideState.message ? (
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                  {rideState.message}
                </pre>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
