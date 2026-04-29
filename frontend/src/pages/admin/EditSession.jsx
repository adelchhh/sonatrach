import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import SessionForm from "../../components/admin/SessionForm";
import { apiGet, apiPut } from "../../api";
import { useT } from "../../i18n/LanguageContext";

export default function EditSession() {
  const t = useT();
  const { id, sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [activityDrawEnabled, setActivityDrawEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setPageError(null);
    apiGet(`/sessions/${sessionId}`)
      .then((res) => {
        setSession(res.data.session);
        setActivityDrawEnabled(!!res.data.session.activity_draw_enabled);
      })
      .catch((err) => setPageError(err.message || "Could not load session."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSave = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiPut(`/sessions/${sessionId}`, payload);
      navigate(`/dashboard/admin/activities/${id}/sessions`);
    } catch (err) {
      setError(err.message || "Could not update session.");
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
            <div className="text-sm text-[#7A8088]">
              <Link
                to={`/dashboard/admin/activities/${id}/sessions`}
                className="text-[#ED8D31] font-medium"
              >
                {t("admin.createSession.backToSessions")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">
                {t("admin.createSession.breadcrumbEdit", { id: sessionId })}
              </span>
            </div>

            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                {t("admin.createSession.editTitle")}
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                {t("admin.createSession.editSubtitle")}
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            {loading ? (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white px-4 py-6 text-sm text-[#7A8088]">
                {t("admin.createSession.loadingSession")}
              </div>
            ) : session ? (
              <SessionForm
                initial={session}
                showDrawFields={activityDrawEnabled}
                submitting={submitting}
                errorMessage={error}
                onCancel={() =>
                  navigate(`/dashboard/admin/activities/${id}/sessions`)
                }
                onSubmit={handleSave}
                submitLabel={t("admin.createSession.saveChanges")}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
