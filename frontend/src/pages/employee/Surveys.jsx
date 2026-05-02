import { useEffect, useMemo, useState } from "react";
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
  const userId = getCurrentUserId();

  const [surveys, setSurveys] = useState([]);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [tab, setTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitting, setSubmitting] = useState(null);

  async function loadSurveys() {
    if (!userId) {
      setLoading(false);
      setPageError("Please log in.");
      return;
    }

    try {
      setLoading(true);
      setPageError("");

      const res = await apiGet(`/api/surveys?user_id=${userId}`);
      const list = Array.isArray(res) ? res : res.data || [];

      setSurveys(list);

      const drafts = {};
      list.forEach((survey) => {
        if (survey.type === "CHOICE" && survey.my_option_id) {
          drafts[survey.id] = survey.my_option_id;
        }

        if (survey.type === "TEXT" && survey.my_response) {
          drafts[survey.id] = survey.my_response;
        }
      });

      setDraftAnswers(drafts);
    } catch (err) {
      setPageError(err.message || "Could not load surveys.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSurveys();
  }, [userId]);

  const activeSurveys = surveys.filter(
    (s) => s.status === "PUBLISHED" && !s.my_response && !s.my_option_id
  );

  const completedSurveys = surveys.filter((s) => s.my_response || s.my_option_id);

  const filteredSurveys = useMemo(() => {
    const source = tab === "ACTIVE" ? activeSurveys : completedSurveys;

    return source.filter((survey) =>
      String(survey.title || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [tab, search, surveys]);

  async function submitAnswer(survey) {
    const value = draftAnswers[survey.id];

    if (!value) {
      alert("Please answer the survey first.");
      return;
    }

    try {
      setSubmitting(survey.id);

      const payload =
        survey.type === "CHOICE"
          ? { user_id: userId, option_id: value }
          : { user_id: userId, answer: String(value).trim() };

      await apiPost(`/api/surveys/${survey.id}/respond`, payload);

      setSelectedSurvey(null);
      await loadSurveys();
    } catch (err) {
      alert(err.message || "Could not submit response.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          {!selectedSurvey ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Surveys & Feedback
                </h1>

                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Participate in internal company surveys, share your opinions,
                  and help us improve the workplace.
                </p>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E5E2DC] pb-3">
                <div className="flex gap-7">
                  <TabButton
                    active={tab === "ACTIVE"}
                    label="Active"
                    count={activeSurveys.length}
                    onClick={() => setTab("ACTIVE")}
                  />

                  <TabButton
                    active={tab === "COMPLETED"}
                    label="Completed"
                    count={completedSurveys.length}
                    onClick={() => setTab("COMPLETED")}
                  />
                </div>

                <div className="flex gap-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search surveys..."
                    className="w-full lg:w-[320px] px-4 py-3 rounded-[12px] border border-[#E5E2DC] bg-white text-sm outline-none"
                  />

                  <button className="px-5 py-3 rounded-[12px] border border-[#E5E2DC] bg-white text-sm font-semibold text-[#2F343B]">
                    Filter
                  </button>
                </div>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              {loading ? (
                <div className="rounded-[20px] border border-[#E5E2DC] bg-white p-8 text-center text-sm text-[#7A8088]">
                  Loading surveys...
                </div>
              ) : filteredSurveys.length === 0 ? (
                <div className="rounded-[20px] border border-[#E5E2DC] bg-white p-8 text-center text-sm text-[#7A8088]">
                  No surveys found.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      completed={!!survey.my_response || !!survey.my_option_id}
                      onOpen={() => setSelectedSurvey(survey)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <TakeSurveyView
              survey={selectedSurvey}
              answer={draftAnswers[selectedSurvey.id]}
              setAnswer={(value) =>
                setDraftAnswers((prev) => ({
                  ...prev,
                  [selectedSurvey.id]: value,
                }))
              }
              onBack={() => setSelectedSurvey(null)}
              onSubmit={() => submitAnswer(selectedSurvey)}
              submitting={submitting === selectedSurvey.id}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function SurveyCard({ survey, completed, onOpen }) {
  const isChoice = survey.type === "CHOICE";

  return (
    <section className="rounded-[20px] bg-white border border-[#E5E2DC] p-6 min-h-[310px] flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-bold text-[#2F343B] leading-[125%]">
            {survey.title || "Survey"}
          </h2>

          <div className="w-14 h-14 rounded-[12px] bg-[#F1F0EC] flex items-center justify-center text-xl">
            {isChoice ? "☑" : "✎"}
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          {Number(survey.required) === 1 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF4D6] text-[#B98900]">
              Mandatory
            </span>
          )}

          {completed && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4F4DD] text-[#2D7A4A]">
              Completed
            </span>
          )}
        </div>

        <p className="text-[#7A8088] text-sm mt-6 leading-[170%] line-clamp-3">
          {survey.question}
        </p>

        <div className="flex gap-3 mt-5 flex-wrap">
          <InfoPill label={isChoice ? "Choice" : "Text"} />
          <InfoPill label={`Due ${formatDate(survey.end_date)}`} />
        </div>
      </div>

      <button
        onClick={onOpen}
        className={`mt-8 w-full px-5 py-3 rounded-[12px] text-sm font-semibold ${
          completed
            ? "border border-[#E5E2DC] bg-white text-[#2F343B]"
            : "bg-[#ED8D31] text-white"
        }`}
      >
        {completed ? "View Answer" : "Take Survey"}
      </button>
    </section>
  );
}

function TakeSurveyView({
  survey,
  answer,
  setAnswer,
  onBack,
  onSubmit,
  submitting,
}) {
  const alreadyAnswered = !!survey.my_response || !!survey.my_option_id;
  const isChoice = survey.type === "CHOICE";

  return (
    <div className="max-w-[900px] mx-auto space-y-7">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full border border-[#E5E2DC] bg-white text-[#2F343B]"
        >
          ←
        </button>

        <div>
          <h1 className="text-[30px] font-extrabold text-[#2F343B]">
            {survey.title}
          </h1>

          <p className="text-sm text-[#7A8088] mt-1">
            Deadline: {formatDate(survey.end_date)}
          </p>
        </div>
      </div>

      <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-6">
        <div className="flex justify-between text-sm font-semibold text-[#2F343B] mb-4">
          <span>Survey Progress</span>
          <span>{alreadyAnswered ? "100%" : answer ? "50%" : "0%"} Completed</span>
        </div>

        <div className="h-2 bg-[#F1F0EC] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ED8D31] rounded-full"
            style={{ width: alreadyAnswered ? "100%" : answer ? "50%" : "0%" }}
          />
        </div>
      </div>

      <section className="rounded-[20px] bg-white border border-[#E5E2DC] p-8">
        <h2 className="text-[22px] font-extrabold text-[#2F343B] leading-[140%]">
          {survey.question}
        </h2>

        <p className="text-sm text-[#7A8088] mt-2 mb-7">
          {isChoice
            ? "Choose one option from the list below."
            : "Write your answer in the text area below."}
        </p>

        {isChoice ? (
          <div className="space-y-3">
            {(survey.options || []).map((option) => (
              <button
                key={option.id}
                disabled={alreadyAnswered}
                onClick={() => setAnswer(option.id)}
                className={`w-full flex items-center gap-4 rounded-[14px] border px-5 py-4 text-left text-sm font-semibold transition ${
                  Number(answer) === Number(option.id) ||
                  Number(survey.my_option_id) === Number(option.id)
                    ? "border-[#ED8D31] bg-[#FFF7EF] text-[#2F343B]"
                    : "border-[#E5E2DC] bg-white text-[#2F343B]"
                } ${alreadyAnswered ? "opacity-75" : ""}`}
              >
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    Number(answer) === Number(option.id) ||
                    Number(survey.my_option_id) === Number(option.id)
                      ? "border-[#ED8D31]"
                      : "border-[#A6ABB2]"
                  }`}
                >
                  {(Number(answer) === Number(option.id) ||
                    Number(survey.my_option_id) === Number(option.id)) && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ED8D31]" />
                  )}
                </span>

                {option.option_text}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer || survey.my_response || ""}
            disabled={alreadyAnswered}
            onChange={(e) => setAnswer(e.target.value)}
            rows={7}
            placeholder="Write your answer..."
            className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none disabled:opacity-70"
          />
        )}
      </section>

      {!alreadyAnswered && (
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-5 py-3 rounded-[12px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
          >
            ← Previous
          </button>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-6 py-3 rounded-[12px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit →"}
          </button>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-4 text-sm font-semibold ${
        active ? "text-[#2F343B]" : "text-[#7A8088]"
      }`}
    >
      {label}
      <span className="ml-2 px-2 py-0.5 rounded-full bg-[#F3C38F] text-[#2F343B] text-xs">
        {count}
      </span>

      {active && (
        <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#ED8D31]" />
      )}
    </button>
  );
}

function InfoPill({ label }) {
  return (
    <span className="px-3 py-2 rounded-[8px] border border-[#E5E2DC] text-xs text-[#7A8088] bg-white">
      {label}
    </span>
  );
}