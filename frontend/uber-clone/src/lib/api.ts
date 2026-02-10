export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:4000";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
};

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token") {
      return value;
    }
  }
  return null;
}

export async function apiRequest<T>(
  path: string,
  { body, headers, ...options }: ApiOptions = {}
): Promise<T> {

    const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...options,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export const apiRoutes = {
  registerUser: "/user/register",
  loginUser: "/user/login",
  logoutUser: "/user/logout",
  profileUser: "/user/profile",
  acceptedRide: "/user/accepted-ride",
  registerCaptain: "/captain/register",
  loginCaptain: "/captain/login",
  logoutCaptain: "/captain/logout",
  profileCaptain: "/captain/profile",
  toggleCaptainAvailability: "/captain/toggle-availability",
  newRide: "/captain/new-ride",
  createRide: "/ride/create-ride",
  acceptRide: "/ride/accept-ride",
};