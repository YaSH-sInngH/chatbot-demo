"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../utils/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch<{ access_token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
      console.log("Login response:", res);
      localStorage.setItem("token", res.access_token);
      console.log("Token stored:", localStorage.getItem("token"));
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="">
      <Link href="/" className="absolute top-10 left-10 text-black underline-offset-4 hover:underline decoration-black">&#x2190; Back to Home</Link>
      <div className="flex flex-col items-center min-h-screen justify-center gap-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-black hover:bg-blue-700 text-white py-2 rounded hover:opacity-90"
        >
          Sign In
        </button>
      </form>
      <p>
        Don&apos;t have an account? <Link className="underline hover:text-blue-500" href="/auth/signup">Sign up</Link>
      </p>
    </div>
    </div>
  );
}