import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SessionForm from "../../components/admin/SessionForm";
import { apiGet, apiPut } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  Alert,
} from "../../components/ui/Studio";

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
      .catch((err) =>
        setPageError(err.message || "Impossible de charger la session.")
      )
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSave = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiPut(`/sessions/${sessionId}`, payload);
      navigate(`/dashboard/admin/activities/${id}/sessions`);
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("admin.createSession.editTitle")}
        subtitle={t("admin.createSession.editSubtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Activités", to: "/dashboard/admin/activities" },
          {
            label: `Sessions`,
            to: `/dashboard/admin/activities/${id}/sessions`,
          },
          {
            label: t("admin.createSession.breadcrumbEdit", { id: sessionId }),
          },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        {loading ? (
          <div className="border border-[#E5E5E5] bg-white py-10 text-center text-[13px] text-[#737373]">
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
      </PageBody>
    </PageShell>
  );
}
