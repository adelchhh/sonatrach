import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialAssignedSites = [
  {
    id: 1,
    name: "Algiers HQ",
    subtitle: "Main Office",
    quota: 50,
    registrations: 34,
    status: "Active",
  },
  {
    id: 2,
    name: "Oran Regional Office",
    subtitle: "Western Region",
    quota: 30,
    registrations: 18,
    status: "Active",
  },
  {
    id: 3,
    name: "Hassi Messaoud",
    subtitle: "Southern Operations",
    quota: 25,
    registrations: 21,
    status: "Active",
  },
];

const availableSites = [
  "Algiers HQ",
  "Oran Regional Office",
  "Hassi Messaoud",
  "Skikda",
  "Ghardaia",
  "Bechar",
];

export default function SitesAndQuotas() {
  const { id, sessionId } = useParams();

  const [modal, setModal] = useState({
    open: false,
    siteId: null,
  });

  const [assignedSites, setAssignedSites] = useState(initialAssignedSites);
  const [form, setForm] = useState({
    site: "",
    quota: "",
  });

  const totalQuota = assignedSites.reduce((sum, site) => sum + site.quota, 0);
  const totalRegistrations = assignedSites.reduce(
    (sum, site) => sum + site.registrations,
    0
  );
  const totalRemainingPlaces = assignedSites.reduce(
    (sum, site) => sum + Math.max(site.quota - site.registrations, 0),
    0
  );

  const handleAddSite = (e) => {
    e.preventDefault();

    if (!form.site || !form.quota) {
      alert("Please fill all fields.");
      return;
    }

    const alreadyAssigned = assignedSites.some((site) => site.name === form.site);

    if (alreadyAssigned) {
      alert("This site is already assigned to the session.");
      return;
    }

    const newSite = {
      id: Date.now(),
      name: form.site,
      subtitle: "New assignment",
      quota: Number(form.quota),
      registrations: 0,
      status: "Active",
    };

    setAssignedSites((prev) => [...prev, newSite]);
    setForm({
      site: "",
      quota: "",
    });
  };

  const handleDelete = () => {
    setAssignedSites((prev) =>
      prev.filter((site) => site.id !== modal.siteId)
    );

    setModal({ open: false, siteId: null });
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
                Sites & Quotas
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                  Sites & Quotas Configuration
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 leading-[170%]">
                  Assign sites and configure quotas for Session {sessionId}. Remaining
                  places are calculated automatically based on current registrations.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/dashboard/admin/activities/${id}/sessions`}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Cancel
                </Link>

                <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                  Verify & Save
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Assigned Sites"
                value={assignedSites.length}
                subtitle={`For Session ${sessionId}`}
              />
              <StatCard
                title="Total Quota"
                value={totalQuota}
                subtitle="Places allocated across sites"
              />
              <StatCard
                title="Registrations"
                value={totalRegistrations}
                subtitle="Current registered employees"
              />
              <StatCard
                title="Remaining Places"
                value={totalRemainingPlaces}
                subtitle="Quota still available"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_340px] gap-6">
              {/* Assigned sites */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC]">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">
                    Assigned Sites
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    Manage the sites and their allocated quotas for this session.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Site Name
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Quota
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Registrations
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Remaining Places
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Status
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {assignedSites.map((site) => {
                        const remainingPlaces = Math.max(
                          site.quota - site.registrations,
                          0
                        );

                        return (
                          <tr
                            key={site.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#2F343B] text-sm">
                                {site.name}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                {site.subtitle}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                              {site.quota}{" "}
                              <span className="font-normal text-[#7A8088]">
                                places
                              </span>
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                              {site.registrations}{" "}
                              <span className="font-normal text-[#7A8088]">
                                registered
                              </span>
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                              {remainingPlaces}{" "}
                              <span className="font-normal text-[#7A8088]">
                                left
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4F4DD] text-[#2D7A4A]">
                                {site.status}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <button
                                onClick={() =>
                                  setModal({
                                    open: true,
                                    siteId: site.id,
                                  })
                                }
                                className="w-9 h-9 rounded-lg border border-[#F0B1B1] bg-white text-[#D85C5C]"
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {assignedSites.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No sites assigned to this session yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Assign site form */}
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[28px] font-bold text-[#2F343B]">
                    Assign Site
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    Allocate quota to a site for this session.
                  </p>

                  <form onSubmit={handleAddSite} className="space-y-4">
                    <Field label="Site *">
                      <select
                        value={form.site}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, site: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option value="">Select a site...</option>
                        {availableSites.map((site) => (
                          <option key={site} value={site}>
                            {site}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Quota (Places) *">
                      <input
                        type="number"
                        min="1"
                        value={form.quota}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, quota: e.target.value }))
                        }
                        placeholder="e.g., 50"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <button
                      type="submit"
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold hover:bg-[#F9F8F6]"
                    >
                      + Add to Session
                    </button>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Remove Site
            </h2>

            <p className="text-sm text-[#7A8088] mb-6">
              Are you sure you want to remove this site from the session?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, siteId: null })}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
      <p className="text-xs text-[#7A8088] mt-2">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}