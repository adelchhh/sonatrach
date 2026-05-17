import { useEffect, useState } from "react";
import { apiGet, getCurrentUserId } from "../../api";

export default function DashboardRightPanel() {
  const [dashboardData, setDashboardData] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [ideaForm, setIdeaForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data.data);
      })
      .catch((error) => {
        console.error("Right panel dashboard error:", error);
      });

    const userId = getCurrentUserId();
    if (userId) {
      apiGet(`/surveys?user_id=${userId}`)
        .then((res) => {
          setSurveys(res.data || []);
        })
        .catch((error) => {
          console.error("Right panel surveys error:", error);
        });
    }
  }, []);

  const handleSubmitIdea = (e) => {
    e.preventDefault();

    console.log("Idea submitted:", ideaForm);

    setIdeaForm({
      title: "",
      description: "",
    });
  };

  return (
    <aside className="w-[300px] min-w-[300px] bg-white border-l border-[#E5E2DC] p-5 overflow-y-auto space-y-6">
      {/* Draw Results */}
      <div className="rounded-[20px] bg-gradient-to-br from-[#F5F4F1] to-white border border-[#E5E2DC] p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-[#E5E2DC]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z"
                stroke="#3FA56B"
                strokeWidth="1.2"
              />
              <path
                d="M5 8l2 2 4-4"
                stroke="#3FA56B"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h3 className="font-bold text-[#2F343B] text-sm">Draw Result</h3>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E2DC] p-4 mb-4">
          <p className="text-xs font-semibold text-[#2F343B] mb-2">
            No draw result yet
          </p>
          <p className="text-xs text-[#7A8088] leading-relaxed">
            Your latest draw result will appear here after registrations and draw
            launch are connected.
          </p>
        </div>

        <button className="w-full px-4 py-2.5 rounded-lg bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
          View result details
        </button>
      </div>

      {/* Documents to Provide */}
      <div>
        <h3 className="font-bold text-[#2F343B] text-sm mb-4">
          Documents to provide
        </h3>

        <div className="rounded-lg bg-[#F5F4F1] border border-[#E5E2DC] p-3">
          <p className="text-xs font-semibold text-[#2F343B] mb-1">
            No pending documents
          </p>
          <p className="text-xs text-[#7A8088] leading-relaxed">
            Required documents will appear here after the documents module is
            connected.
          </p>
        </div>
      </div>

      {/* Active Surveys */}
      <div>
        <h3 className="font-bold text-[#2F343B] text-sm mb-4">
          Active surveys
        </h3>

        {surveys.length === 0 ? (
          <div className="rounded-lg border border-[#E5E2DC] p-3 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#ED8D31] flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-bold">📋</span>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-[#2F343B]">
                  No active surveys yet
                </p>
                <p className="text-xs text-[#7A8088] mt-0.5">
                  Surveys will appear when communicator tools are connected.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {surveys.slice(0, 3).map((survey) => (
              <div
                key={survey.id}
                className="rounded-lg border border-[#E5E2DC] p-3 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#ED8D31] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-bold">📋</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#2F343B] truncate">
                      {survey.title || "Survey"}
                    </p>
                    <p className="text-xs text-[#7A8088] mt-0.5 line-clamp-2">
                      {survey.question}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Summary */}
      <div className="rounded-[20px] bg-[#F5F4F1] border border-[#E5E2DC] p-5">
        <h3 className="font-bold text-[#2F343B] text-sm mb-4">
          Platform summary
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-[#7A8088]">Activities</span>
            <span className="font-semibold text-[#2F343B]">
              {dashboardData?.total_activities ?? 0}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#7A8088]">Open activities</span>
            <span className="font-semibold text-[#2F343B]">
              {dashboardData?.active_activities ?? 0}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#7A8088]">Pending requests</span>
            <span className="font-semibold text-[#2F343B]">
              {dashboardData?.pending_registrations ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Idea Box */}
      <div className="rounded-[20px] bg-gradient-to-b from-[#ED8D31] to-[#d97d26] text-white p-5">
        <div className="flex items-start gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g clipPath="url(#clip_idea_panel)">
              <path
                d="M11.25 10.5C11.4 9.75 11.775 9.225 12.375 8.625C13.125 7.95 13.5 6.975 13.5 6C13.5 3.516 11.484 1.5 9 1.5C6.516 1.5 4.5 3.516 4.5 6C4.5 6.75 4.65 7.65 5.625 8.625C6.15 9.15 6.6 9.75 6.75 10.5M6.75 13.5H11.25M7.5 16.5H10.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip_idea_panel">
                <rect width="18" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>

          <div>
            <h3 className="font-bold text-sm">Have an idea?</h3>
          </div>
        </div>

        <p className="text-xs opacity-90 mb-4">
          Share your suggestions for new activities, trips, or ways to improve
          the employee experience.
        </p>

        <form onSubmit={handleSubmitIdea} className="space-y-3">
          <input
            type="text"
            value={ideaForm.title}
            onChange={(e) =>
              setIdeaForm({ ...ideaForm, title: e.target.value })
            }
            placeholder="Your idea title..."
            className="w-full px-3 py-2 rounded-lg bg-white text-[#2F343B] text-xs placeholder:text-[#7A8088] focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />

          <textarea
            value={ideaForm.description}
            onChange={(e) =>
              setIdeaForm({ ...ideaForm, description: e.target.value })
            }
            placeholder="Describe your idea..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white text-[#2F343B] text-xs placeholder:text-[#7A8088] focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-white text-[#ED8D31] font-semibold text-sm hover:bg-opacity-95 transition-colors"
          >
            Submit an idea
          </button>
        </form>
      </div>
    </aside>
  );
}
