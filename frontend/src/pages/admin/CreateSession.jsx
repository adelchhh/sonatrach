import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SessionForm from "../../components/admin/SessionForm";
import { apiGet, apiPost } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import { PageShell, PageHeader, PageBody } from "../../components/ui/Studio";

export default function CreateSession() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet(`/activities/${id}`)
      .then((res) => setActivity(res.data))
      .catch((err) =>
        setError(err.message || t("admin.createSession.loadingActivity"))
      )
      .finally(() => setLoadingActivity(false));
  }, [id]);

  const handleSave = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiPost(`/activities/${id}/sessions`, payload);
      const newSessionId = res?.data?.id;
      if (newSessionId) {
        navigate(
          `/dashboard/admin/activities/${id}/sessions/${newSessionId}/sites-quotas`
        );
      } else {
        navigate(`/dashboard/admin/activities/${id}/sessions`);
      }
    } catch (err) {
      setError(err.message || "Création impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("admin.createSession.title")}
        subtitle={
          activity
            ? t("admin.createSession.subtitleFor", { title: activity.title })
            : t("admin.createSession.subtitleGeneric")
        }
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Activités", to: "/dashboard/admin/activities" },
          {
            label: activity?.title || `#${id}`,
            to: `/dashboard/admin/activities/${id}/sessions`,
          },
          { label: t("admin.createSession.breadcrumbCreate") },
        ]}
      />

      <PageBody>
        {loadingActivity ? (
          <div className="border border-[#E5E5E5] bg-white py-10 text-center text-[13px] text-[#737373]">
            {t("admin.createSession.loadingActivity")}
          </div>
        ) : (
          <SessionForm
            showDrawFields={!activity || !!activity.draw_enabled}
            submitting={submitting}
            errorMessage={error}
            onCancel={() =>
              navigate(`/dashboard/admin/activities/${id}/sessions`)
            }
            onSubmit={handleSave}
            submitLabel={t("admin.createSession.save")}
          />
        )}
      </PageBody>
    </PageShell>
  );
}
