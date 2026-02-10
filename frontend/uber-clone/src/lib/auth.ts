export type Role = "rider" | "captain";

export function setSessionRole(role: Role) {
  localStorage.setItem("ride-role", role);
  document.cookie = `ride-role=${role}; path=/; max-age=3600; samesite=lax`;
}

export function clearSessionRole() {
  localStorage.removeItem("ride-role");
  document.cookie = "ride-role=; path=/; max-age=0; samesite=lax";
}

export function getStoredRole(): Role | null {
  const role = localStorage.getItem("ride-role");
  return role === "rider" || role === "captain" ? role : null;
}
