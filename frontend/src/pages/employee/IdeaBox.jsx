import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost, getCurrentUserId } from "../../api";
import { useT } from "../../i18n/LanguageContext";

const STATUS_STYLES = {
  UNDER_REVIEW: "bg-[#FFF4D6] text-[#B98900]",
  ACCEPTED: "bg-[#D4F4DD] text-[#2D7A4A]",
  ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
};

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

export default function IdeaBox() {
  const t = useT();
  const CATEGORY_OPTIONS = [
    { value: "ACTIVITIES", label: t("ideaCategories.ACTIVITIES") },
    { value: "SERVICES", label: t("ideaCategories.SERVICES") },
    { value: "COMMUNICATION", label: t("ideaCategories.COMMUNICATION") },
    { value: "WORKPLACE", label: t("ideaCategories.WORKPLACE") },
    { value: "WELLBEING", label: t("ideaCategories.WELLBEING") },
  ];
  const STATUS_LABEL = {
    UNDER_REVIEW: t("employee.ideas.statuses.UNDER_REVIEW"),
    ACCEPTED: t("employee.ideas.statuses.ACCEPTED"),
    ARCHIVED: t("employee.ideas.statuses.ARCHIVED"),
  };

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [form, setForm] = useState({ category: "ACTIVITIES", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userId = getCurrentUserId();

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError(t("common.pleaseLogin"));
      return;
    }
    setLoading(true);
    apiGet(`/me/ideas?user_id=${userId}`)
      .then((res) => setIdeas(res.data || []))
      .catch((err) => setPageError(err.message || t("common.serverError")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const stats = useMemo(
    () => ({
      total: ideas.length,
      review: ideas.filter((i) => i.status === "UNDER_REVIEW").length,
      accepted: ideas.filter((i) => i.status === "ACCEPTED").length,
    }),
    [ideas]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    if (!form.content.trim()) {
      setFormError(t("employee.ideas.alertEmpty"));
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/ideas", {
        user_id: userId,
        content: form.content.trim(),
        category: form.category,
      });
      setForm({ category: "ACTIVITIES", content: "" });
      setSuccess(t("employee.ideas.successText"));
      load();
    } catch (err) {
      setFormError(err.message || t("common.serverError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                {t("employee.ideas.title")}
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                {t("employee.ideas.subtitle")}
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title={t("employee.ideas.statMine")} value={stats.total} />
              <StatCard title={t("employee.ideas.statReview")} value={stats.review} />
              <StatCard title={t("employee.ideas.statAccepted")} value={stats.accepted} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6">
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6 h-fit">
                <h2 className="text-[22px] font-bold text-[#2F343B] mb-2">
                  {t("employee.ideas.submitTitle")}
                </h2>
                <p className="text-sm text-[#7A8088] mb-4">
                  {t("employee.ideas.submitHint")}
                </p>

                {success && (
                  <div className="rounded-[12px] border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm mb-3">
                    {success}
                  </div>
                )}

                {formError && (
                  <div className="rounded-[12px] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm mb-3">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      {t("employee.ideas.category")}
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      {t("employee.ideas.ideaLabel")}
                    </label>
                    <textarea
                      value={form.content}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, content: e.target.value }))
                      }
                      rows={6}
                      placeholder={t("employee.ideas.ideaPlaceholder")}
                      maxLength={2000}
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                    />
                    <p className="text-xs text-[#7A8088] mt-1">
                      {form.content.length} / 2000
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {submitting ? t("common.submitting") : t("employee.ideas.submitBtn")}
                  </button>
                </form>
              </section>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC]">
                  <h2 className="text-[22px] font-bold text-[#2F343B]">
                    {t("employee.ideas.myIdeas")}
                  </h2>
                </div>

                {loading && (
                  <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                    {t("employee.ideas.loading")}
                  </p>
                )}

                {!loading && ideas.length === 0 && (
                  <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                    {t("employee.ideas.empty")}
                  </p>
                )}

                <div className="divide-y divide-[#E5E2DC]">
                  {ideas.map((i) => (
                    <div key={i.id} className="px-5 py-4">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1F0EC] text-[#7A8088]">
                          {t(`ideaCategories.${i.category}`) || i.category}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_STYLES[i.status] || ""
                          }`}
                        >
                          {STATUS_LABEL[i.status] || i.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#2F343B] leading-[170%]">
                        {i.content}
                      </p>
                      <p className="text-xs text-[#7A8088] mt-2">
                        {t("employee.ideas.submittedOn", { date: formatDate(i.submitted_at) })}
                      </p>
                      {i.moderator_response && (
                        <div className="mt-3 rounded-[12px] bg-[#F9F8F6] px-3 py-2 text-sm">
                          <p className="text-xs text-[#7A8088] uppercase font-semibold mb-1">
                            {t("employee.ideas.moderatorResponse")}
                          </p>
                          <p className="text-[#2F343B]">
                            {i.moderator_response}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}
