import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet } from "../../api";

const STATUS_LABEL = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
  DRAW_DONE: "Draw done",
  FINISHED: "Finished",
  CANCELLED: "Cancelled",
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

export default function SessionDetails() {
  const { id, sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGet(`/sessions/${sessionId}`)
      .then((res) => {
        setSession(res.data.session);
        setSites(res.data.sites || []);
      })
      .catch((err) => setError(err.message || "Could not load session."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="text-sm text-[#7A8088]">
              <Link
                to="/dashboard/admin/activities"
                className="text-[#ED8D31] font-medium"
              >
                Manage Activities
              </Link>
              <span className="mx-2">›</span>
              <Link
                to={`/dashboard/admin/activities/${id}/sessions`}
                className="text-[#ED8D31] font-medium"
              >
                Sessions
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">
                Session #{sessionId}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B]">
                  Session Details
                </h1>
                <p className="text-[#7A8088] text-sm mt-2">
                  Review the full configuration of this session.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/dashboard/admin/activities/${id}/sessions/${sessionId}/edit`}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Edit session
                </Link>
                <Link
                  to={`/dashboard/admin/activities/${id}/sessions/${sessionId}/sites-quotas`}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
                >
                  Manage sites & quotas
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white px-4 py-6 text-sm text-[#7A8088]">
                Loading session...
              </div>
            ) : session ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <InfoCard
                    label="Activity"
                    value={session.activity_title || `Activity ${id}`}
                  />
                  <InfoCard
                    label="Status"
                    value={STATUS_LABEL[session.status] || session.status}
                  />
                  <InfoCard
                    label="Start Date"
                    value={formatDate(session.start_date)}
                  />
                  <InfoCard
                    label="End Date"
                    value={formatDate(session.end_date)}
                  />
                  <InfoCard
                    label="Registration Deadline"
                    value={formatDate(session.registration_deadline)}
                  />
                  <InfoCard
                    label="Document Upload Deadline"
                    value={formatDate(session.document_upload_deadline)}
                  />
                  <InfoCard
                    label="Draw Date"
                    value={formatDate(session.draw_date)}
                  />
                  <InfoCard
                    label="Draw Location"
                    value={session.draw_location || "—"}
                  />
                  <InfoCard
                    label="Confirmation Delay"
                    value={`${session.confirmation_delay_hours} hour(s)`}
                  />
                  <InfoCard
                    label="Substitutes"
                    value={String(session.substitutes_count)}
                  />
                  <InfoCard
                    label="Transport"
                    value={session.transport_included ? "Covered" : "Not covered"}
                  />
                  <InfoCard
                    label="Telefax / Document"
                    value={session.telefax_url || "—"}
                  />
                  <InfoCard
                    label="Total Sites"
                    value={`${session.sites_count} site(s)`}
                  />
                  <InfoCard
                    label="Total Quota"
                    value={`${session.total_quota} place(s)`}
                  />
                  <InfoCard
                    label="Registrations"
                    value={String(session.registrations_count)}
                  />
                </div>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[22px] font-bold text-[#2F343B]">
                      Sites & Quotas
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Allocations of places per site for this session.
                    </p>
                  </div>

                  {sites.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-[#7A8088]">
                      No sites assigned yet. Use "Manage sites & quotas" to add some.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-[#FBFAF8]">
                          <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Site
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Address
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Quota
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sites.map((site) => (
                            <tr
                              key={site.session_site_id}
                              className="border-t border-[#E5E2DC]"
                            >
                              <td className="px-5 py-3 text-sm font-semibold text-[#2F343B]">
                                {site.name}
                              </td>
                              <td className="px-5 py-3 text-sm text-[#7A8088]">
                                {site.address || "—"}
                              </td>
                              <td className="px-5 py-3 text-sm font-medium text-[#2F343B]">
                                {site.quota}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{label}</p>
      <p className="text-lg font-bold text-[#2F343B] mt-2 break-words">
        {value}
      </p>
    </div>
  );
}
