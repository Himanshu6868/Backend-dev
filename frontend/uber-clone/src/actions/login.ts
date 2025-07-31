import { API_ROUTES } from "@/actions/actions";

export async function loginUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("heloooo", formData);

  // 👉 call your API here
  const res = await fetch(API_ROUTES.REGISTER, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  console.log("Login successful:", data);

  // You can also handle cookies / redirect here
  return data;
}
