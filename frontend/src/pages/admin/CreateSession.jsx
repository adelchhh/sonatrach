import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import SessionForm from "../../components/admin/SessionForm";
import { apiGet, apiPost } from "../../api";

export default function CreateSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet(`/activities/${id}`)
      .then((res) => setActivity(res.data))
      .catch((err) => setError(err.message || "Could not load activity."))
      .finally(() => setLoadingActivity(false));
  }, [id]);

  const handleSave = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiPost(`/activities/${id}/sessions`, payload);
      navigate(`/dashboard/admin/activities/${id}/sessions`);
    } catch (err) {
      setError(err.message || "Could not create session.");
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
                Sessions
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">
                Create Session
              </span>
            </div>

            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Create Session
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                {activity
                  ? `Configure a new session for "${activity.title}".`
                  : "Configure the session dates, draw settings, deadlines and logistics."}
              </p>
            </div>

            {loadingActivity ? (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white px-4 py-6 text-sm text-[#7A8088]">
                Loading activity...
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
                submitLabel="Save Session"
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
