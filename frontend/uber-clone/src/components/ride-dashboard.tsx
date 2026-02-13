"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiRequest, apiRoutes } from "@/lib/api";
import { clearSessionRole, getStoredRole, Role } from "@/lib/auth";

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

type RiderRideState = {
  id: string;
  pickup: string;
  destination: string;
  status: string;
};

// const fallbackRideOffers: RideOffer[] = [
//   {
//     id: "ride-1",
//     rider: "Aarav",
//     pickup: "Koramangala 4th Block",
//     destination: "Indiranagar Metro",
//     price: "₹182",
//     eta: "2 mins",
//   },
//   {
//     id: "ride-2",
//     rider: "Meera",
//     pickup: "UB City",
//     destination: "MG Road",
//     price: "₹146",
//     eta: "4 mins",
//   },
// ];

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
];

const POLL_INTERVAL_MS = 3000;
const THROTTLED_POLL_INTERVAL_MS = 15000;

function getPollDelay(error?: unknown) {
  if (error instanceof ApiError && error.status === 429) {
    return THROTTLED_POLL_INTERVAL_MS;
  }

  return POLL_INTERVAL_MS;
}

export default function RideDashboard({ role }: { role: Role }) {
  const router = useRouter();
  const [selectedRide, setSelectedRide] = useState(rideTypes[0]);
  const [riderStatus, setRiderStatus] = useState<string>("");
  const [acceptedRideId, setAcceptedRideId] = useState<string | null>(null);
  const [captainStatus, setCaptainStatus] = useState<string>("");
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([]);
  const [rideRequest, setRideRequest] = useState<RiderRideState | null>(null);
  const [loadingRide, setLoadingRide] = useState(false);
  const [cancelingRide, setCancelingRide] = useState(false);

  const acceptedRide = useMemo(
    () => rideOffers.find((ride) => ride.id === acceptedRideId) ?? null,
    [acceptedRideId, rideOffers]
  );

  useEffect(() => {
    const storedRole = getStoredRole();
    if (!storedRole) {
      router.replace("/login");
      return;
    }

    if (storedRole !== role) {
      router.replace(storedRole === "rider" ? "/ride" : "/captain");
      return;
    }

    const validateRole = async () => {
      try {
        await apiRequest(role === "rider" ? apiRoutes.profileUser : apiRoutes.profileCaptain, {
          method: "GET",
        });
      } catch {
        clearSessionRole();
        router.replace("/login");
      }
    };

    validateRole();
  }, [role, router]);

  useEffect(() => {
    let isActive = true;

    const pollForNewRide = async () => {
      if (!isActive || role !== "captain") {
        return;
      }

      let pollError: unknown;

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
        pollError = error;
        setCaptainStatus(error instanceof Error ? error.message : "Unable to fetch new rides");
      } finally {
        if (isActive) {
          setTimeout(pollForNewRide, getPollDelay(pollError));
        }
      }
    };

    if (role === "captain") {
      pollForNewRide();
    }

    return () => {
      isActive = false;
    };
  }, [role]);

  useEffect(() => {
    let isActive = true;

    const pollAcceptedRide = async () => {
      if (!isActive || !rideRequest?.id || role !== "rider") {
        return;
      }

      let pollError: unknown;

      try {
        const response = await apiRequest<{ _id?: string; status?: string }>(
          `${apiRoutes.acceptedRide}?rideId=${rideRequest.id}`,
          {
            method: "GET",
          }
        );

        if (response && typeof response === "object" && response.status) {
          setRideRequest((prev) => (prev ? { ...prev, status: response.status ?? prev.status } : prev));
          if (response.status === "accepted") {
            setRiderStatus("Ride accepted • Your captain is on the way");
          }
          if (response.status === "cancelled") {
            setRiderStatus("Ride cancelled");
          }
        }
      } catch (error) {
        pollError = error;
        setRiderStatus(error instanceof Error ? error.message : "Unable to get ride updates");
      } finally {
        if (isActive && rideRequest?.status === "requested") {
          setTimeout(pollAcceptedRide, getPollDelay(pollError));
        }
      }
    };

    pollAcceptedRide();

    return () => {
      isActive = false;
    };
  }, [rideRequest?.id, rideRequest?.status, role]);

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
      const response = await apiRequest<{
        _id?: string;
        pickup?: string;
        destination?: string;
        status?: string;
      }>(apiRoutes.createRide, {
        method: "POST",
        body: payload,
      });
      if (response && typeof response === "object" && response._id) {
        setRideRequest({
          id: response._id,
          pickup: response.pickup ?? payload.pickup,
          destination: response.destination ?? payload.destination,
          status: response.status ?? "requested",
        });
      }
      setRiderStatus(`Searching captain • ${selectedRide.title} ETA ${selectedRide.time}`);
    } catch (error) {
      setRiderStatus(error instanceof Error ? error.message : "Ride request failed");
    } finally {
      setLoadingRide(false);
    }
  };

  const handleAcceptRide = async (rideId: string, backendId?: string) => {
    setAcceptedRideId(rideId);
    setCaptainStatus("Accepting ride...");
    try {
      await apiRequest(`${apiRoutes.acceptRide}?rideId=${backendId ?? rideId}`, { method: "PUT" });
      setRideOffers((prev) =>
        prev.map((ride) =>
          ride.id === rideId || ride.backendId === backendId ? { ...ride, status: "accepted" } : ride
        )
      );
      setCaptainStatus("Accepted • Navigate to pickup location");
    } catch (error) {
      setCaptainStatus(error instanceof Error ? error.message : "Ride acceptance failed");
    }
  };

  const handleRiderCancel = async () => {
    if (!rideRequest?.id) return;
    setCancelingRide(true);
    try {
      await apiRequest(`${apiRoutes.cancelRideByUser}?rideId=${rideRequest.id}`, { method: "PUT" });
      setRideRequest((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      setRiderStatus("Ride cancelled successfully");
    } catch (error) {
      setRiderStatus(error instanceof Error ? error.message : "Unable to cancel ride");
    } finally {
      setCancelingRide(false);
    }
  };

  const handleCaptainCancel = async (rideId: string, backendId?: string) => {
    const resolvedRideId = backendId ?? rideId;
    setCaptainStatus("Cancelling ride...");
    try {
      await apiRequest(`${apiRoutes.cancelRideByCaptain}?rideId=${resolvedRideId}`, { method: "PUT" });
      setRideOffers((prev) => prev.filter((ride) => (ride.backendId ?? ride.id) !== resolvedRideId));
      if (acceptedRideId === rideId) {
        setAcceptedRideId(null);
      }
      setCaptainStatus("Ride cancelled");
    } catch (error) {
      setCaptainStatus(error instanceof Error ? error.message : "Unable to cancel ride");
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest(role === "rider" ? apiRoutes.logoutUser : apiRoutes.logoutCaptain, {
        method: "GET",
      });
    } finally {
      clearSessionRole();
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex items-center justify-between border-b pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {role === "rider" ? "Rider Dashboard" : "Captain Dashboard"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {role === "rider" ? "Book a Ride" : "Manage Requests"}
            </h1>
          </div>

          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </header>


        {role === "rider" ? (
          <Card>
            <CardHeader>
              <CardTitle>Book a ride</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleRiderSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="pickup">Pickup location</Label>
                  <Input id="pickup" name="pickup" placeholder="Koramangala, Bangalore" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" name="destination" placeholder="MG Road, Bangalore" required />
                </div>
                <div className="space-y-3">
                  {rideTypes.map((ride) => {
                    const isSelected = selectedRide.id === ride.id;

                    return (
                      <button
                        key={ride.id}
                        type="button"
                        onClick={() => setSelectedRide(ride)}
                        className={`w-full rounded-xl border p-4 transition-all duration-150 ${isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-accent/40"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="font-semibold text-base">{ride.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {ride.description} • {ride.time} away
                            </p>
                          </div>

                          <p className="text-base font-semibold">{ride.price}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-xl"
                  disabled={loadingRide}
                >
                  {loadingRide ? "Requesting ride..." : `Confirm ${selectedRide.title}`}
                </Button>

              </form>

              {rideRequest ? (
                <div className="rounded-2xl border border-border p-4">
                  <p className="font-semibold">{rideRequest.pickup} → {rideRequest.destination}</p>
                  {/* {rideRequest.status === "accepted" ? (
                    

                  ) : ( */}
                    <p className="mt-3 text-sm text-muted-foreground">Current status: {rideRequest.status}</p>
                  {/* )} */}

                  {rideRequest.status !== "cancelled" && rideRequest.status !== "completed" ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="mt-4 w-full"
                      onClick={handleRiderCancel}
                      disabled={cancelingRide}
                    >
                      {cancelingRide ? "Cancelling..." : "Cancel ride"}
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {riderStatus && (
                <div className="rounded-lg bg-muted p-3 text-sm font-medium">
                  {riderStatus}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nearby ride requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {rideOffers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
                    <p className="font-semibold">No ride requests</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Stay online. New ride requests will appear automatically.
                    </p>
                  </div>
                ) : (
                  rideOffers.map((ride) => (
                    <div
                      key={ride.id}
                      className="rounded-xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-base">
                          {ride.pickup} → {ride.destination}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Rider: {ride.rider}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          ETA: {ride.eta} • Fare: {ride.price}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={() => handleAcceptRide(ride.id, ride.backendId)}
                          disabled={!ride.backendId}
                        >
                          Accept
                        </Button>

                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            setRideOffers((prev) =>
                              prev.filter((r) => r.id !== ride.id)
                            )
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {captainStatus ? <p className="text-sm font-semibold">{captainStatus}</p> : null}
              {acceptedRideId && acceptedRide ? (
                <p className="text-sm text-muted-foreground">Active ride from {acceptedRide.pickup}</p>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
