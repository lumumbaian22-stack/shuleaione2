import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { School, Users, CreditCard, Palette, UserPlus } from "lucide-react";

export default function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [themeForm, setThemeForm] = useState({
    primaryColor: "#2563eb",
    secondaryColor: "#10b981",
    fontStyle: "Inter",
  });
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "",
    class: "",
    stream: "",
    parentId: "",
  });

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

      if (profileData.user.school_id) {
        const studentsRes = await fetch(
          `/api/students?schoolId=${profileData.user.school_id}`,
        );
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);

        const themeRes = await fetch(
          `/api/schools/${profileData.user.school_id}/theme`,
        );
        const themeData = await themeRes.json();
        setTheme(themeData.theme);
        if (themeData.theme) {
          setThemeForm({
            primaryColor: themeData.theme.primary_color || "#2563eb",
            secondaryColor: themeData.theme.secondary_color || "#10b981",
            fontStyle: themeData.theme.font_style || "Inter",
          });
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const handleUpdateTheme = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/schools/${profile.school_id}/theme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor: themeForm.primaryColor,
          secondaryColor: themeForm.secondaryColor,
          fontStyle: themeForm.fontStyle,
        }),
      });

      if (response.ok) {
        setShowThemeEditor(false);
        fetchData();
        alert("Theme updated successfully!");
      } else {
        alert("Failed to update theme");
      }
    } catch (err) {
      console.error("Error updating theme:", err);
      alert("Failed to update theme");
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentForm.name,
          class: studentForm.class,
          stream: studentForm.stream || null,
          schoolId: profile.school_id,
          parentId: studentForm.parentId
            ? parseInt(studentForm.parentId)
            : null,
        }),
      });

      if (response.ok) {
        setShowAddStudent(false);
        setStudentForm({ name: "", class: "", stream: "", parentId: "" });
        fetchData();
        alert("Student added successfully!");
      } else {
        alert("Failed to add student");
      }
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Failed to add student");
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="mt-1 text-blue-100">
                {profile?.school_name || "School Management"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/subscription"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Subscription
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {students.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <School className="text-green-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Classes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {[...new Set(students.map((s) => s.class))].length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <UserPlus className="text-purple-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">With Parents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {students.filter((s) => s.parent_id).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <CreditCard className="text-orange-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Subscription</p>
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {theme?.subscription_plan || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setShowAddStudent(true)}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <UserPlus className="text-blue-600 mb-3" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Add Student
            </h3>
            <p className="text-gray-600">
              Register a new student to your school
            </p>
          </button>

          <button
            onClick={() => setShowThemeEditor(true)}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <Palette className="text-purple-600 mb-3" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Customize Theme
            </h3>
            <p className="text-gray-600">
              Update your school's branding and colors
            </p>
          </button>
        </div>

        {/* Current Theme Preview */}
        {theme && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Current Theme
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Primary Color</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border border-gray-300"
                    style={{ backgroundColor: theme.primary_color }}
                  />
                  <span className="font-mono text-sm">
                    {theme.primary_color}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Secondary Color</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border border-gray-300"
                    style={{ backgroundColor: theme.secondary_color }}
                  />
                  <span className="font-mono text-sm">
                    {theme.secondary_color}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Font Style</p>
                <p className="text-lg font-semibold">{theme.font_style}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Editor Modal */}
      {showThemeEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Customize Theme
            </h2>
            <form onSubmit={handleUpdateTheme} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={themeForm.primaryColor}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        primaryColor: e.target.value,
                      })
                    }
                    className="w-16 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeForm.primaryColor}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        primaryColor: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={themeForm.secondaryColor}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="w-16 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeForm.secondaryColor}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Style
                </label>
                <select
                  value={themeForm.fontStyle}
                  onChange={(e) =>
                    setThemeForm({ ...themeForm, fontStyle: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowThemeEditor(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update Theme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add New Student
            </h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  required
                  type="text"
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <input
                  required
                  type="text"
                  value={studentForm.class}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, class: e.target.value })
                  }
                  placeholder="Grade 7"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream (Optional)
                </label>
                <input
                  type="text"
                  value={studentForm.stream}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, stream: e.target.value })
                  }
                  placeholder="A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent ID (Optional)
                </label>
                <input
                  type="number"
                  value={studentForm.parentId}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, parentId: e.target.value })
                  }
                  placeholder="Leave empty if unknown"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudent(false);
                    setStudentForm({
                      name: "",
                      class: "",
                      stream: "",
                      parentId: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



