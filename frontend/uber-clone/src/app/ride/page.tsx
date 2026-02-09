"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, apiRoutes } from "@/lib/api";

type ViewMode = "rider" | "captain";

type RideOffer = {
  id: string;
  backendId?: string;
  rider: string;
  pickup: string;
  destination: string;
  price: string;
  eta: string;
  status?: string;
};

const fallbackRideOffers: RideOffer[] = [
  {
    id: "ride-1",
    rider: "Aarav",
    pickup: "Koramangala 4th Block",
    destination: "Indiranagar Metro",
    price: "₹182",
    eta: "2 mins",
  },
  {
    id: "ride-2",
    rider: "Meera",
    pickup: "UB City",
    destination: "MG Road",
    price: "₹146",
    eta: "4 mins",
  },
  {
    id: "ride-3",
    rider: "Zoya",
    pickup: "Jayanagar 4th T Block",
    destination: "Cubbon Park",
    price: "₹205",
    eta: "6 mins",
  },
];

const rideTypes = [
  {
    id: "uberx",
    title: "UberX",
    description: "Everyday rides, 4 seats",
    price: "₹148",
    time: "4 min",
  },
  {
    id: "comfort",
    title: "Comfort",
    description: "Newer cars, extra legroom",
    price: "₹192",
    time: "6 min",
  },
  {
    id: "xl",
    title: "XL",
    description: "6 seats, extra space",
    price: "₹238",
    time: "8 min",
  },
];

export default function RidePage() {
  const [mode, setMode] = useState<ViewMode>("rider");
  const [selectedRide, setSelectedRide] = useState(rideTypes[0]);
  const [riderStatus, setRiderStatus] = useState<string>("");
  const [acceptedRideId, setAcceptedRideId] = useState<string | null>(null);
  const [captainStatus, setCaptainStatus] = useState<string>("");
  const [rideOffers, setRideOffers] = useState<RideOffer[]>(
    fallbackRideOffers
  );
  const [rideRequestId, setRideRequestId] = useState<string | null>(null);
  const [loadingRide, setLoadingRide] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState<string>("");

  const acceptedRide = useMemo(
    () => rideOffers.find((ride) => ride.id === acceptedRideId) ?? null,
    [acceptedRideId]
  );

  useEffect(() => {
    const storedRole = localStorage.getItem("ride-role");
    if (storedRole === "captain" || storedRole === "rider") {
      setMode(storedRole);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const pollForNewRide = async () => {
      if (!isActive || mode !== "captain") {
        return;
      }

      try {
        const response = await apiRequest<{
          _id?: string;
          pickup?: string;
          destination?: string;
          status?: string;
        }>(apiRoutes.newRide, { method: "GET" });

        if (response && typeof response === "object" && response._id) {
          const newRide: RideOffer = {
            id: response._id,
            backendId: response._id,
            rider: "New rider",
            pickup: response.pickup ?? "Pickup pending",
            destination: response.destination ?? "Destination pending",
            price: "₹180",
            eta: "3 mins",
            status: response.status,
          };

          setRideOffers((prev) => {
            const exists = prev.some((ride) => ride.backendId === newRide.backendId);
            return exists ? prev : [newRide, ...prev];
          });
        }
      } catch (error) {
        setCaptainStatus(
          error instanceof Error ? error.message : "Unable to fetch new rides"
        );
      } finally {
        if (isActive) {
          setTimeout(pollForNewRide, 1000);
        }
      }
    };

    if (mode === "captain") {
      pollForNewRide();
    }

    return () => {
      isActive = false;
    };
  }, [mode]);

  useEffect(() => {
    let isActive = true;

    const pollAcceptedRide = async () => {
      if (!isActive || !rideRequestId) {
        return;
      }

      try {
        const response = await apiRequest<{ status?: string } | string>(
          apiRoutes.acceptedRide,
          { method: "GET" }
        );
        if (response && typeof response === "object" && response.status) {
          setRiderStatus("Ride accepted • Your captain is on the way");
        }
      } catch (error) {
        setRiderStatus(
          error instanceof Error ? error.message : "Unable to get ride updates"
        );
      } finally {
        if (isActive) {
          setTimeout(pollAcceptedRide, 1000);
        }
      }
    };

    pollAcceptedRide();

    return () => {
      isActive = false;
    };
  }, [rideRequestId]);

  const handleRiderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      pickup: String(formData.get("pickup") ?? ""),
      destination: String(formData.get("destination") ?? ""),
    };

    setLoadingRide(true);
    setRiderStatus("Requesting your ride...");
    try {
      const response = await apiRequest<{ _id?: string; status?: string }>(
        apiRoutes.createRide,
        {
          method: "POST",
          body: payload,
        }
      );
      if (response && typeof response === "object" && response._id) {
        setRideRequestId(response._id);
      }
      setRiderStatus(
        `Driver on the way • ${selectedRide.title} arriving in ${selectedRide.time}`
      );
    } catch (error) {
      setRiderStatus(
        error instanceof Error ? error.message : "Ride request failed"
      );
    } finally {
      setLoadingRide(false);
    }
  };

  const handleAcceptRide = async (rideId: string, backendId?: string) => {
    setAcceptedRideId(rideId);
    setCaptainStatus("Accepting ride...");
    try {
      await apiRequest(
        `${apiRoutes.acceptRide}?rideId=${backendId ?? rideId}`,
        { method: "PUT" }
      );
      setCaptainStatus("Accepted • Navigate to pickup location");
    } catch (error) {
      setCaptainStatus(
        error instanceof Error ? error.message : "Ride acceptance failed"
      );
    }
  };

  const handleCompleteRide = () => {
    setCaptainStatus("Trip complete • Ready for the next ride");
    setAcceptedRideId(null);
  };

  const handleLogout = async () => {
    setLogoutStatus("Logging out...");
    try {
      await apiRequest(
        mode === "rider" ? apiRoutes.logoutUser : apiRoutes.logoutCaptain,
        { method: "GET" }
      );
      setLogoutStatus("Logged out successfully.");
    } catch (error) {
      setLogoutStatus(
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Ride flow
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold">
                Manage rides like Uber or Ola.
              </h1>
              <p className="text-lg text-muted-foreground">
                Switch between rider and captain to see the real-time UI states.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {(["rider", "captain"] as ViewMode[]).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setMode(view)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    mode === view
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  {view === "rider" ? "Rider view" : "Captain view"}
                </button>
              ))}
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
          {logoutStatus ? (
            <p className="text-sm text-muted-foreground">{logoutStatus}</p>
          ) : null}
        </header>

        {mode === "rider" ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Book a ride</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4" onSubmit={handleRiderSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="pickup">Pickup location</Label>
                    <Input
                      id="pickup"
                      name="pickup"
                      placeholder="Koramangala, Bangalore"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      name="destination"
                      placeholder="MG Road, Bangalore"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label>Select a ride</Label>
                    <div className="grid gap-3">
                      {rideTypes.map((ride) => (
                        <button
                          key={ride.id}
                          type="button"
                          onClick={() => setSelectedRide(ride)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            selectedRide.id === ride.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:bg-accent"
                          }`}
                        >
                          <div>
                            <p className="text-base font-semibold">
                              {ride.title}
                            </p>
                            <p className="text-xs opacity-70">
                              {ride.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-semibold">
                              {ride.price}
                            </p>
                            <p className="text-xs opacity-70">{ride.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loadingRide}>
                    {loadingRide
                      ? "Requesting ride..."
                      : `Confirm ${selectedRide.title}`}
                  </Button>
                </form>
                {riderStatus ? (
                  <div className="rounded-2xl border border-border bg-muted/60 p-4 text-sm">
                    <p className="font-semibold">{riderStatus}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Captain Rohan • White Swift Dzire • KA 01 AB 5432
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Live trip preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-secondary/70 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Map
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-background p-4 shadow-sm">
                      <p className="text-sm text-muted-foreground">Pickup</p>
                      <p className="text-base font-semibold">
                        Koramangala 4th Block
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background p-4 shadow-sm">
                      <p className="text-sm text-muted-foreground">
                        Destination
                      </p>
                      <p className="text-base font-semibold">MG Road</p>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em]">
                          Driver ETA
                        </p>
                        <p className="text-lg font-semibold">3 mins</p>
                      </div>
                      <p className="text-base font-semibold">
                        {selectedRide.price}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <p>Share trip status with family.</p>
                  <p>Quickly update pickup notes for the captain.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Nearby ride requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rideOffers.map((ride) => (
                  <div
                    key={ride.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Rider • {ride.rider}
                        </p>
                        <p className="text-base font-semibold">
                          {ride.pickup} → {ride.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold">{ride.price}</p>
                        <p className="text-xs text-muted-foreground">
                          Pickup in {ride.eta}
                        </p>
                        {!ride.backendId ? (
                          <p className="text-xs text-muted-foreground">
                            Demo ride
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      onClick={() => handleAcceptRide(ride.id, ride.backendId)}
                      disabled={!ride.backendId}
                    >
                      {ride.backendId ? "Accept ride" : "Awaiting live request"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Captain status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-secondary/70 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Active trip
                  </p>
                  {acceptedRide ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-background p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                          Pickup
                        </p>
                        <p className="text-base font-semibold">
                          {acceptedRide.pickup}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-background p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                          Destination
                        </p>
                        <p className="text-base font-semibold">
                          {acceptedRide.destination}
                        </p>
                      </div>
                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleCompleteRide}
                      >
                        Slide to complete trip
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Accept a ride to start navigation and see trip details.
                    </p>
                  )}
                </div>
                {captainStatus ? (
                  <div className="rounded-2xl border border-border bg-muted/60 p-4 text-sm">
                    <p className="font-semibold">{captainStatus}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Keep eyes on the route for a safer trip.
                    </p>
                  </div>
                ) : null}
                <div className="grid gap-3 rounded-2xl border border-border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Earnings today
                    </span>
                    <span className="font-semibold">₹1,248</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Rating average
                    </span>
                    <span className="font-semibold">4.92</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trips done</span>
                    <span className="font-semibold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}