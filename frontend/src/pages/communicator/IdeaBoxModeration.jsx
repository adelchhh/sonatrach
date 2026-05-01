import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { getIdeas, moderateIdea } from "../../services/ideaService";

export default function IdeaBoxModeration() {
  const [ideas, setIdeas] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedIdea = ideas.find((idea) => idea.id === selectedId) || null;

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    try {
      setLoading(true);
      const response = await getIdeas();

      const data = Array.isArray(response)
        ? response
        : response.data || response.ideas || [];
      
      setIdeas(data);
      setSelectedId(data[0]?.id ?? null);
    } catch (err) {
      setError(err.message || "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }

  async function handleModerate(status) {
    if (!selectedIdea) return;

    try {
      const updated = await moderateIdea(selectedIdea.id, {
        status,
        moderator_response: feedback || null,
      });

      setIdeas((prev) =>
        prev.map((idea) => (idea.id === selectedIdea.id ? updated : idea))
      );

      setFeedback("");
    } catch (err) {
      setError(err.message || "Failed to moderate idea");
    }
  }

  const pendingCount = ideas.filter((i) => i.status === "PENDING").length;
  const reviewedCount = ideas.filter((i) => i.status === "REVIEWED").length;
  const archivedCount = ideas.filter((i) => i.status === "ARCHIVED").length;

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                  Communicateur tools
                </p>

                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Idea Box Moderation
                </h1>

                <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                  Review employee ideas, add feedback, mark them as reviewed, or
                  archive them.
                </p>
              </div>

              {error && (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Pending" value={pendingCount} />
                <StatCard title="Reviewed" value={reviewedCount} />
                <StatCard title="Archived" value={archivedCount} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_360px] gap-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Submitted Ideas
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Ideas submitted by employees.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Idea
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Author
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Submitted
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              Loading ideas...
                            </td>
                          </tr>
                        ) : (
                          ideas.map((idea) => (
                            <tr
                              key={idea.id}
                              onClick={() => {
                                setSelectedId(idea.id);
                                setFeedback(idea.moderator_response || "");
                              }}
                              className={`border-t border-[#E5E2DC] cursor-pointer align-top ${
                                selectedId === idea.id ? "bg-[#FCFBF9]" : ""
                              }`}
                            >
                              <td className="px-5 py-5">
                                <p className="font-semibold text-[#2F343B] text-sm">
                                  {idea.title}
                                </p>
                                <p className="text-xs text-[#7A8088] mt-1 max-w-[360px]">
                                  {shortText(idea.content)}
                                </p>
                              </td>

                              <td className="px-5 py-5 text-sm text-[#7A8088]">
                                {idea.user?.name || idea.author || "Employee"}
                              </td>

                              <td className="px-5 py-5 text-sm text-[#7A8088]">
                                {formatDate(idea)}
                              </td>

                              <td className="px-5 py-5">
                                <StatusBadge status={idea.status} />
                              </td>
                            </tr>
                          ))
                        )}

                        {!loading && ideas.length === 0 && (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No ideas submitted yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">
                    Moderation Panel
                  </h3>

                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    Select an idea to review its content and leave feedback.
                  </p>

                  {selectedIdea ? (
                    <div className="space-y-4">
                      <SummaryRow label="Title" value={selectedIdea.title} />
                      <SummaryRow
                        label="Status"
                        value={selectedIdea.status}
                      />
                      <SummaryRow
                        label="Submitted"
                        value={formatDate(selectedIdea)}
                      />

                      <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
                        <p className="text-sm font-semibold text-[#2F343B] mb-2">
                          Idea content
                        </p>
                        <p className="text-sm text-[#7A8088] leading-[170%] whitespace-pre-line">
                          {selectedIdea.content}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                          Moderator feedback
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={5}
                          placeholder="Write feedback for this idea..."
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleModerate("REVIEWED")}
                          className="w-full px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
                        >
                          Mark as Reviewed
                        </button>

                        <button
                          onClick={() => handleModerate("ARCHIVED")}
                          className="w-full px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                        >
                          Archive Idea
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#7A8088]">
                      Select an idea from the list.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function formatDate(idea) {
  return idea.submitted_at || idea.created_at?.slice(0, 10) || "-";
}

function shortText(text, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-bold text-[#2F343B] text-right">
        {value || "-"}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-[#FFF4D6] text-[#B98900]",
    REVIEWED: "bg-[#D4F4DD] text-[#2D7A4A]",
    ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-[#F1F0EC] text-[#7A8088]"
      }`}
    >
      {status}
    </span>
  );
}