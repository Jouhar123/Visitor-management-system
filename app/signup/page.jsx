"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully! Redirecting to sign in...");

        setFormData({ name: "", email: "", password: "" });

        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setError(data.message || "Failed to create account");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
          className="flex flex-col gap-6 items-center justify-center bg-white/60 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/40 w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Sign Up</h1>

          {error && (
            <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="w-full p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="name" className="text-gray-700 font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-gray-800 transition disabled:opacity-50"
              required
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-gray-800 transition disabled:opacity-50"
              required
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-gray-800 transition disabled:opacity-50"
              required
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          <div className="w-full flex flex-col items-center mt-2 gap-1">
            <span className="text-xs text-gray-500">
              Already have an account?
            </span>
            <Link
              href="/signin"
              className="text-sm text-blue-600 hover:underline"
            >
              Sign In
            </Link>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
            <a href="/visitor" className="text-sm text-blue-600 hover:underline">
              Visitor Registration
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
