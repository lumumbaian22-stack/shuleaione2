import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { TrendingUp, AlertCircle, ArrowLeft } from "lucide-react";

export default function ParentAlertsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      setProfile(profileData.user);

      const alertsRes = await fetch(
        `/api/alerts?parentId=${profileData.user.id}`,
      );
      const alertsData = await alertsRes.json();
      setAlerts(alertsData.alerts || []);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      setAlerts(
        alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)),
      );
    } catch (err) {
      console.error("Error marking alert as read:", err);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <a
              href="/parent/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </a>
            <div>
              <h1 className="text-3xl font-bold">All Alerts</h1>
              <p className="mt-1 text-blue-100">
                View all notifications about your children
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No alerts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 rounded-lg border-l-4 ${
                  alert.type === "positive"
                    ? "bg-green-50 border-green-500"
                    : "bg-orange-50 border-orange-500"
                } ${alert.read ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {alert.type === "positive" ? (
                    <TrendingUp
                      className="text-green-600 flex-shrink-0"
                      size={24}
                    />
                  ) : (
                    <AlertCircle
                      className="text-orange-600 flex-shrink-0"
                      size={24}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`font-bold text-lg ${
                            alert.type === "positive"
                              ? "text-green-900"
                              : "text-orange-900"
                          }`}
                        >
                          {alert.student_name}
                        </p>
                        <p
                          className={`mt-2 ${
                            alert.type === "positive"
                              ? "text-green-700"
                              : "text-orange-700"
                          }`}
                        >
                          {alert.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-3">
                          {new Date(alert.sent_at).toLocaleString()}
                        </p>
                      </div>
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



