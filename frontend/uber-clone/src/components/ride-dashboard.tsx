"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, LogOut, MapPinned, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/StatusBadge";
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

const rideTypes = [
  { id: "uberx", title: "UberX", description: "Everyday rides, 4 seats", price: "₹148", time: "4 min" },
  { id: "comfort", title: "Comfort", description: "Newer cars, extra legroom", price: "₹192", time: "6 min" },
];

const POLL_INTERVAL_MS = 3000;
const THROTTLED_POLL_INTERVAL_MS = 15000;

function getPollDelay(error?: unknown) {
  if (error instanceof ApiError && error.status === 429) return THROTTLED_POLL_INTERVAL_MS;
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

  const acceptedRide = useMemo(() => rideOffers.find((ride) => ride.id === acceptedRideId) ?? null, [acceptedRideId, rideOffers]);

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
        await apiRequest(role === "rider" ? apiRoutes.profileUser : apiRoutes.profileCaptain, { method: "GET" });
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
      if (!isActive || role !== "captain") return;
      let pollError: unknown;
      try {
        const response = await apiRequest<{ _id?: string; pickup?: string; destination?: string; status?: string }>(apiRoutes.newRide, { method: "GET" });
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
          setRideOffers((prev) => (prev.some((ride) => ride.backendId === newRide.backendId) ? prev : [newRide, ...prev]));
        }
      } catch (error) {
        pollError = error;
        setCaptainStatus(error instanceof Error ? error.message : "Unable to fetch new rides");
      } finally {
        if (isActive) setTimeout(pollForNewRide, getPollDelay(pollError));
      }
    };
    if (role === "captain") pollForNewRide();
    return () => {
      isActive = false;
    };
  }, [role]);

  useEffect(() => {
    let isActive = true;
    const pollAcceptedRide = async () => {
      if (!isActive || !rideRequest?.id || role !== "rider") return;
      let pollError: unknown;
      try {
        const response = await apiRequest<{ _id?: string; status?: string }>(`${apiRoutes.acceptedRide}?rideId=${rideRequest.id}`, { method: "GET" });
        if (response && typeof response === "object" && response.status) {
          setRideRequest((prev) => (prev ? { ...prev, status: response.status ?? prev.status } : prev));
          if (response.status === "accepted") setRiderStatus("Ride accepted • Your captain is on the way");
          if (response.status === "cancelled") setRiderStatus("Ride cancelled");
        }
      } catch (error) {
        pollError = error;
        setRiderStatus(error instanceof Error ? error.message : "Unable to get ride updates");
      } finally {
        if (isActive && rideRequest?.status === "requested") setTimeout(pollAcceptedRide, getPollDelay(pollError));
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
    const payload = { pickup: String(formData.get("pickup") ?? ""), destination: String(formData.get("destination") ?? "") };
    setLoadingRide(true);
    setRiderStatus("Requesting your ride...");
    try {
      const response = await apiRequest<{ _id?: string; pickup?: string; destination?: string; status?: string }>(apiRoutes.createRide, { method: "POST", body: payload });
      if (response && typeof response === "object" && response._id) {
        setRideRequest({ id: response._id, pickup: response.pickup ?? payload.pickup, destination: response.destination ?? payload.destination, status: response.status ?? "requested" });
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
      setRideOffers((prev) => prev.map((ride) => (ride.id === rideId || ride.backendId === backendId ? { ...ride, status: "accepted" } : ride)));
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
      if (acceptedRideId === rideId) setAcceptedRideId(null);
      setCaptainStatus("Ride cancelled");
    } catch (error) {
      setCaptainStatus(error instanceof Error ? error.message : "Unable to cancel ride");
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest(role === "rider" ? apiRoutes.logoutUser : apiRoutes.logoutCaptain, { method: "GET" });
    } finally {
      clearSessionRole();
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white/80 p-5 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-widest text-black/50">{role === "rider" ? "Rider Dashboard" : "Captain Dashboard"}</p>
            <h1 className="mt-1 text-3xl font-bold">{role === "rider" ? "Book a Ride" : "Manage Requests"}</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>Logout</Button>
        </header>

        {role === "rider" ? (
          <Card>
            <form className="space-y-5" onSubmit={handleRiderSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pickup">Pickup location</Label>
                  <Input id="pickup" name="pickup" placeholder="Koramangala, Bangalore" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" name="destination" placeholder="MG Road, Bangalore" required />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {rideTypes.map((ride) => {
                  const isSelected = selectedRide.id === ride.id;
                  return (
                    <button
                      key={ride.id}
                      type="button"
                      onClick={() => setSelectedRide(ride)}
                      className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                        isSelected ? "border-[#6366f1] bg-indigo-50 shadow-[0_10px_25px_rgba(0,0,0,0.1)]" : "border-black/10 bg-white hover:scale-[1.02]"
                      }`}
                    >
                      <p className="font-semibold">{ride.title}</p>
                      <p className="text-sm text-black/60">{ride.description}</p>
                      <p className="mt-2 text-lg font-bold text-[#6366f1]">{ride.price}</p>
                    </button>
                  );
                })}
              </div>

              <Button type="submit" className="w-full" loading={loadingRide}>{loadingRide ? "Requesting ride..." : `Confirm ${selectedRide.title}`}</Button>
            </form>

            {rideRequest ? (
              <div className="mt-5 rounded-xl border border-black/10 bg-black/[0.02] p-4">
                <p className="font-semibold">{rideRequest.pickup} → {rideRequest.destination}</p>
                <p className="mt-2 text-sm text-black/60">Current status: {rideRequest.status}</p>
                {rideRequest.status === "accepted" ? (
                  <div className="mt-3 rounded-lg bg-emerald-50 p-3">
                    <StatusBadge label="Captain is on the way" tone="success" />
                  </div>
                ) : null}
                {rideRequest.status !== "cancelled" && rideRequest.status !== "completed" ? (
                  <Button type="button" variant="danger" className="mt-4 w-full" onClick={handleRiderCancel} loading={cancelingRide}>
                    {cancelingRide ? "Cancelling..." : "Cancel ride"}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {riderStatus ? <p className="mt-4 text-sm font-medium text-black/70">{riderStatus}</p> : null}
          </Card>
        ) : (
          <Card>
            <h2 className="text-xl font-semibold">Nearby ride requests</h2>
            <div className="mt-4 space-y-4">
              {rideOffers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-black/20 bg-black/[0.02] p-8 text-center">
                  <p className="font-semibold">No ride requests</p>
                  <p className="mt-2 text-sm text-black/60">Stay online. New ride requests will appear automatically.</p>
                </div>
              ) : (
                rideOffers.map((ride) => (
                  <div key={ride.id} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5">
                    <p className="font-semibold">{ride.pickup} → {ride.destination}</p>
                    <p className="text-sm text-black/60">Rider: {ride.rider}</p>
                    <p className="text-sm text-black/60">ETA: {ride.eta} • Fare: {ride.price}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Button className="w-full" variant="success" onClick={() => handleAcceptRide(ride.id, ride.backendId)} disabled={!ride.backendId} icon={<CheckCircle2 className="h-4 w-4" />}>Accept</Button>
                      <Button className="w-full" variant="danger" onClick={() => handleCaptainCancel(ride.id, ride.backendId)} icon={<XCircle className="h-4 w-4" />}>Cancel</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {captainStatus ? <p className="mt-4 text-sm font-semibold text-black/70">{captainStatus}</p> : null}
            {acceptedRideId && acceptedRide ? (
              <div className="mt-4 rounded-xl bg-indigo-50 p-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"><Clock3 className="h-4 w-4" /> Active ride from {acceptedRide.pickup}</div>
              </div>
            ) : null}
          </Card>
        )}

        {role === "rider" && rideRequest?.status === "accepted" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="inline-flex items-center gap-2 font-semibold text-emerald-700">
              <MapPinned className="h-4 w-4" /> Captain is on the way
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
