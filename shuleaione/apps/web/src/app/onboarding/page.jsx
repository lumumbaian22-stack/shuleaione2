import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingRole = localStorage.getItem("pendingRole");
      if (pendingRole) setRole(pendingRole);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, schoolId: parseInt(schoolId), phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Clear localStorage
      localStorage.removeItem("pendingRole");

      // Redirect based on role
      if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (role === "teacher") {
        window.location.href = "/teacher/dashboard";
      } else {
        window.location.href = "/parent/dashboard";
      }
    } catch (err) {
      console.error(err);
      setError("Could not complete setup. Please try again.");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Just a few more details to get started
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select your role</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="admin">School Administrator</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              School ID
            </label>
            <input
              required
              type="number"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              placeholder="Enter your school ID (e.g., 1)"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-xs text-gray-500">
              Contact your school administrator for your school ID
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 000 000"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </button>
        </div>
      </form>
    </div>
  );
}



