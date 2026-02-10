"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, apiRoutes } from "@/lib/api";
import { clearSessionRole, Role } from "@/lib/auth";

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
];

export default function RideDashboard({ role }: { role: Role }) {
  const router = useRouter();
  const [selectedRide, setSelectedRide] = useState(rideTypes[0]);
  const [riderStatus, setRiderStatus] = useState<string>("");
  const [acceptedRideId, setAcceptedRideId] = useState<string | null>(null);
  const [captainStatus, setCaptainStatus] = useState<string>("");
  const [rideOffers, setRideOffers] = useState<RideOffer[]>(fallbackRideOffers);
  const [rideRequestId, setRideRequestId] = useState<string | null>(null);
  const [loadingRide, setLoadingRide] = useState(false);

  const acceptedRide = useMemo(
    () => rideOffers.find((ride) => ride.id === acceptedRideId) ?? null,
    [acceptedRideId, rideOffers]
  );

  useEffect(() => {
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
        setCaptainStatus(error instanceof Error ? error.message : "Unable to fetch new rides");
      } finally {
        if (isActive) {
          setTimeout(pollForNewRide, 1000);
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
      if (!isActive || !rideRequestId || role !== "rider") {
        return;
      }

      try {
        const response = await apiRequest<{ status?: string } | string>(apiRoutes.acceptedRide, {
          method: "GET",
        });
        if (response && typeof response === "object" && response.status) {
          setRiderStatus("Ride accepted • Your captain is on the way");
        }
      } catch (error) {
        setRiderStatus(error instanceof Error ? error.message : "Unable to get ride updates");
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
  }, [rideRequestId, role]);

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
      const response = await apiRequest<{ _id?: string; status?: string }>(apiRoutes.createRide, {
        method: "POST",
        body: payload,
      });
      if (response && typeof response === "object" && response._id) {
        setRideRequestId(response._id);
      }
      setRiderStatus(`Driver on the way • ${selectedRide.title} arriving in ${selectedRide.time}`);
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
      setCaptainStatus("Accepted • Navigate to pickup location");
    } catch (error) {
      setCaptainStatus(error instanceof Error ? error.message : "Ride acceptance failed");
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
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {role === "rider" ? "Rider dashboard" : "Captain dashboard"}
          </p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-4xl font-semibold">
              {role === "rider" ? "Book your ride" : "Manage ride requests"}
            </h1>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
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
                {rideTypes.map((ride) => (
                  <button
                    key={ride.id}
                    type="button"
                    onClick={() => setSelectedRide(ride)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      selectedRide.id === ride.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{ride.title}</span>
                    <span>{ride.price}</span>
                  </button>
                ))}
                <Button type="submit" className="w-full" disabled={loadingRide}>
                  {loadingRide ? "Requesting ride..." : `Confirm ${selectedRide.title}`}
                </Button>
              </form>
              {riderStatus ? <p className="text-sm font-semibold">{riderStatus}</p> : null}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nearby ride requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rideOffers.map((ride) => (
                <div key={ride.id} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-base font-semibold">{ride.pickup} → {ride.destination}</p>
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
