import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Users, BookOpen, Plus, TrendingUp, Search } from "lucide-react";

export default function TeacherDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddMarks, setShowAddMarks] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [markForm, setMarkForm] = useState({
    subject: "",
    score: "",
    term: "",
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
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const handleAddMarks = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/students/${selectedStudent.id}/marks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: markForm.subject,
            score: parseInt(markForm.score),
            term: markForm.term,
          }),
        },
      );

      if (response.ok) {
        setShowAddMarks(false);
        setMarkForm({ subject: "", score: "", term: "" });
        setSelectedStudent(null);
        alert(
          "Marks added successfully! Alerts have been generated for the parent.",
        );
      } else {
        alert("Failed to add marks");
      }
    } catch (err) {
      console.error("Error adding marks:", err);
      alert("Failed to add marks");
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

  const classes = [...new Set(students.map((s) => s.class))];
  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === "all" || s.class === selectedClass;
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="mt-1 text-blue-100">Welcome, {user.name}</p>
            </div>
            <a
              href="/account/logout"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <BookOpen className="text-green-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Classes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {classes.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-purple-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">School</p>
                <p className="text-lg font-bold text-gray-900">
                  {profile?.school_name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Students</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No students found</p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Class: {student.class}{" "}
                        {student.stream ? `• Stream: ${student.stream}` : ""}
                      </p>
                      {student.parent_name && (
                        <p className="text-sm text-gray-500 mt-1">
                          Parent: {student.parent_name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowAddMarks(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                      Add Marks
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Marks Modal */}
      {showAddMarks && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add Marks for {selectedStudent.name}
            </h2>
            <form onSubmit={handleAddMarks} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  required
                  type="text"
                  value={markForm.subject}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, subject: e.target.value })
                  }
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (0-100)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={markForm.score}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, score: e.target.value })
                  }
                  placeholder="85"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term
                </label>
                <select
                  required
                  value={markForm.term}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, term: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Term</option>
                  <option value="Term 1 2024">Term 1 2024</option>
                  <option value="Term 2 2024">Term 2 2024</option>
                  <option value="Term 3 2024">Term 3 2024</option>
                  <option value="Term 1 2025">Term 1 2025</option>
                  <option value="Term 2 2025">Term 2 2025</option>
                  <option value="Term 3 2025">Term 3 2025</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMarks(false);
                    setSelectedStudent(null);
                    setMarkForm({ subject: "", score: "", term: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



