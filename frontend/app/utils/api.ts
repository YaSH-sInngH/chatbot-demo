const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // Important for cookies if using them
  });

  if (!res.ok) {
    const errorData: unknown = await res.json().catch(() => ({}));

    console.error(`API Error [${res.status}]`, errorData);

    let message = res.statusText;

    if (
      typeof errorData === "object" &&
      errorData !== null &&
      "message" in errorData &&
      typeof (errorData as { message?: unknown }).message === "string"
    ) {
      message = (errorData as { message: string }).message;
    }

    if (res.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Session expired. Please login again.");
    }

    throw new Error(message);
  }

  return res.json();
}