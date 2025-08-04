"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../utils/api";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div>
      <Link href="/" className="absolute top-10 left-10 text-black underline-offset-4 hover:underline decoration-black">&#x2190; Back to Home</Link>
      <div className="flex flex-col items-center min-h-screen justify-center gap-4">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="text"
          placeholder="Name"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          Create Account
        </button>
      </form>
      <p>
        Already have an account? <a className="underline hover:text-blue-500" href="/auth/login">Login</a>
      </p>
    </div>
    </div>
  );
}