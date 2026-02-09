import React from "react";
import { CardDemo } from "./loginPage";

const page = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-12 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Welcome back
          </p>
          <h1 className="text-4xl font-semibold">
            Log in to keep your rides moving.
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose rider or captain mode to unlock tailored dashboards, smart
            ride suggestions, and real-time trip updates.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/ride"
              className="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Preview ride flow
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              Create account
            </a>
          </div>
        </div>
        <div className="flex w-full justify-center lg:w-auto">
          <CardDemo />
        </div>
      </div>
    </div>
  );
};

export default page;
