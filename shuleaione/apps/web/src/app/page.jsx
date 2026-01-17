import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";
import { School, GraduationCap, Users, TrendingUp } from "lucide-react";

export default function HomePage() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.user && data.user.role) {
        // Redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (data.user.role === "teacher") {
          window.location.href = "/teacher/dashboard";
        } else if (data.user.role === "parent") {
          window.location.href = "/parent/dashboard";
        }
      }

      setProfile(data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // If user is not logged in, show landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center text-white mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <School size={48} />
              <h1 className="text-5xl font-bold">Shule AI</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Premium School-Parent Digital Ecosystem connecting schools,
              teachers, and parents for better student outcomes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/account/signin"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
              <TrendingUp className="mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Performance Tracking</h3>
              <p className="text-blue-100">
                Track student progress with detailed analytics and automatic
                alerts for parents
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
              <Users className="mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Parent Engagement</h3>
              <p className="text-blue-100">
                Keep parents informed with real-time alerts and educational
                content about CBC
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
              <GraduationCap className="mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Custom Branding</h3>
              <p className="text-blue-100">
                Personalize the platform with your school's colors, logo, and
                branding
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-5xl font-bold mb-2">100%</p>
                <p className="text-blue-100">CBC Compliant</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">Real-time</p>
                <p className="text-blue-100">Parent Alerts</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">Secure</p>
                <p className="text-blue-100">Data Protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in but hasn't completed onboarding
  if (!profile?.role) {
    if (typeof window !== "undefined") {
      window.location.href = "/onboarding";
    }
    return null;
  }

  // Loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-lg text-gray-600 mb-4">
          Redirecting to your dashboard...
        </div>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}



