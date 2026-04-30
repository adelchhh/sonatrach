import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost, getCurrentUserId } from "../../api";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [draftAnswers, setDraftAnswers] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const userId = getCurrentUserId();

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError("Please log in.");
      return;
    }
    setLoading(true);
    setPageError(null);
    apiGet(`/surveys?user_id=${userId}`)
      .then((res) => {
        setSurveys(res.data || []);
        const drafts = {};
        (res.data || []).forEach((s) => {
          if (s.my_response) drafts[s.id] = s.my_response;
        });
        setDraftAnswers(drafts);
      })
      .catch((err) => setPageError(err.message || "Could not load surveys."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const handleSubmit = async (surveyId) => {
    const answer = (draftAnswers[surveyId] || "").trim();
    if (!answer) {
      alert("Please write an answer first.");
      return;
    }
    setSubmitting(surveyId);
    try {
      await apiPost(`/surveys/${surveyId}/respond`, {
        user_id: userId,
        answer,
      });
      load();
    } catch (err) {
      alert(err.message || "Could not submit response.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-[900px]">
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Surveys
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Share your opinion. Your answers help us improve activities and
                services.
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            {loading && (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white p-8 text-center text-sm text-[#7A8088]">
                Loading surveys...
              </div>
            )}

            {!loading && surveys.length === 0 && !pageError && (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white p-8 text-center text-sm text-[#7A8088]">
                No active surveys at the moment. Check back later.
              </div>
            )}

            {surveys.map((s) => (
              <section
                key={s.id}
                className="rounded-[24px] bg-white border border-[#E5E2DC] p-6"
              >
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div>
                    <h2 className="text-[22px] font-bold text-[#2F343B]">
                      {s.title || "Survey"}
                    </h2>
                    {s.activity_title && (
                      <p className="text-xs text-[#7A8088] mt-1">
                        About: {s.activity_title}
                      </p>
                    )}
                    <p className="text-xs text-[#7A8088] mt-1">
                      Open until {formatDate(s.end_date)}
                    </p>
                  </div>

                  {s.my_response && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4F4DD] text-[#2D7A4A]">
                      Already answered
                    </span>
                  )}

                  {Number(s.required) === 1 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF4D6] text-[#B98900]">
                      Required
                    </span>
                  )}
                </div>

                <p className="text-[#2F343B] text-base leading-[170%] mb-4">
                  {s.question}
                </p>

                <textarea
                  value={draftAnswers[s.id] || ""}
                  onChange={(e) =>
                    setDraftAnswers((p) => ({ ...p, [s.id]: e.target.value }))
                  }
                  rows={4}
                  placeholder="Your answer..."
                  className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                />

                {!s.my_response && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleSubmit(s.id)}
                      disabled={submitting === s.id}
                      className="px-5 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {submitting === s.id ? "Submitting..." : "Submit answer"}
                    </button>
                  </div>
                )}
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
