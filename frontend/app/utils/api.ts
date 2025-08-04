const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T = any>(
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
    credentials: "include" // Important for cookies if using them
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error(`API Error [${res.status}]`, errorData);
    
    if (res.status === 401) {
      localStorage.removeItem("token");
      // Let the component handle the redirect
      throw new Error("Session expired. Please login again.");
    }
    
    throw new Error(errorData.message || res.statusText);
  }

  return res.json();
}