import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BookOpen,
  Bell,
} from "lucide-react";

export default function ParentDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      setProfile(profileData.user);

      // Fetch students
      const studentsRes = await fetch(
        `/api/students?parentId=${profileData.user.id}`,
      );
      const studentsData = await studentsRes.json();
      setStudents(studentsData.students || []);

      // Select first student by default
      if (studentsData.students && studentsData.students.length > 0) {
        setSelectedStudent(studentsData.students[0]);
        fetchStudentPerformance(studentsData.students[0].id);
      }

      // Fetch alerts
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

  const fetchStudentPerformance = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}/performance`);
      const data = await res.json();
      setPerformance(data.performance);
    } catch (err) {
      console.error("Error fetching performance:", err);
    }
  };

  const handleStudentChange = (student) => {
    setSelectedStudent(student);
    fetchStudentPerformance(student.id);
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

  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
              <p className="mt-1 text-blue-100">Parent Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/parent/education"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <BookOpen size={20} />
                <span className="hidden sm:inline">Learn About CBC</span>
              </a>
              <a
                href="/account/logout"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Selector */}
        {students.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Child
            </label>
            <select
              value={selectedStudent?.id || ""}
              onChange={(e) => {
                const student = students.find(
                  (s) => s.id === parseInt(e.target.value),
                );
                handleStudentChange(student);
              }}
              className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.class}
                </option>
              ))}
            </select>
          </div>
        )}

        {students.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-yellow-800">
              No students linked to your account. Please contact your school
              administrator.
            </p>
          </div>
        )}

        {/* Alerts Section */}
        {unreadAlerts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Recent Alerts</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {unreadAlerts.length} new
              </span>
            </div>
            <div className="space-y-3">
              {unreadAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === "positive"
                      ? "bg-green-50 border-green-500"
                      : "bg-orange-50 border-orange-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.type === "positive" ? (
                      <TrendingUp
                        className="text-green-600 flex-shrink-0"
                        size={20}
                      />
                    ) : (
                      <AlertCircle
                        className="text-orange-600 flex-shrink-0"
                        size={20}
                      />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          alert.type === "positive"
                            ? "text-green-900"
                            : "text-orange-900"
                        }`}
                      >
                        {alert.student_name}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          alert.type === "positive"
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}
                      >
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.sent_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/parent/alerts"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              View all alerts →
            </a>
          </div>
        )}

        {/* Performance Overview */}
        {selectedStudent && performance && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Average Score
              </h3>
              <p className="text-4xl font-bold text-blue-600">
                {performance.averageScore}%
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Subjects
              </h3>
              <p className="text-4xl font-bold text-indigo-600">
                {performance.totalSubjects}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Class</h3>
              <p className="text-4xl font-bold text-purple-600">
                {selectedStudent.class}
              </p>
            </div>
          </div>
        )}

        {/* Subject Performance */}
        {selectedStudent &&
          performance &&
          performance.subjectPerformance.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Subject Performance
              </h2>
              <div className="space-y-4">
                {performance.subjectPerformance.map((subject, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {subject.subject}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {subject.latestScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            subject.latestScore >= 80
                              ? "bg-green-500"
                              : subject.latestScore >= 60
                                ? "bg-blue-500"
                                : subject.latestScore >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${subject.latestScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}



