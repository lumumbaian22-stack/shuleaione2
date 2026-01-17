import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  BookOpen,
  Video,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";

export default function ParentEducationPage() {
  const { data: user, loading: userLoading } = useUser();
  const [content, setContent] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/education-content");
      const data = await res.json();
      setContent(data.content || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching content:", err);
      setLoading(false);
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

  const filteredContent =
    filter === "all" ? content : content.filter((c) => c.type === filter);

  const getIcon = (type) => {
    switch (type) {
      case "video":
        return <Video size={24} className="text-blue-600" />;
      case "guide":
        return <FileText size={24} className="text-green-600" />;
      case "infographic":
        return <ImageIcon size={24} className="text-purple-600" />;
      default:
        return <BookOpen size={24} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <a
              href="/parent/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </a>
            <div>
              <h1 className="text-3xl font-bold">Parent Education</h1>
              <p className="mt-1 text-blue-100">
                Learn about the CBC system and how to support your child
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Content
          </button>
          <button
            onClick={() => setFilter("video")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "video"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setFilter("guide")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "guide"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Guides
          </button>
          <button
            onClick={() => setFilter("infographic")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "infographic"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Infographics
          </button>
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              No educational content available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                    )}
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                      {item.type}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



