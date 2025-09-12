"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `/api/user?email=${form.email}&password=${form.password}`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      // Save token in localStorage
      localStorage.setItem("authToken", data.token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error during sign in:", err);
      setError("Failed to login. Please try again.");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <img
        src="/signup-background.jpg"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
      />
      <div className="relative z-10 w-full max-w-md p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 items-center justify-center bg-white/60 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/40"
        >
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Sign In</h1>

          {error && (
            <div className="text-red-600 font-medium bg-red-100 px-3 py-2 rounded-lg w-full text-center">
              {error}
            </div>
          )}

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </label>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-gray-800 transition"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-gray-800 transition"
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition duration-150"
            type="submit"
          >
            Sign In
          </button>

          <div className="w-full flex flex-col items-center mt-2 gap-1">
            <span className="text-xs text-gray-500">
              Don't have an account?
            </span>
            <Link href="/signup" className="text-sm text-blue-600 hover:underline">
              Sign Up
            </Link>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
