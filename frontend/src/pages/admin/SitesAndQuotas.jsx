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
    alternates: 15,
    status: "Active",
  },
  {
    id: 2,
    name: "Oran Regional Office",
    subtitle: "Western Region",
    quota: 30,
    alternates: 10,
    status: "Active",
  },
  {
    id: 3,
    name: "Hassi Messaoud",
    subtitle: "Southern Operations",
    quota: 25,
    alternates: 10,
    status: "Active",
  },
  {
    id: 4,
    name: "Skikda",
    subtitle: "Eastern Region",
    quota: 15,
    alternates: 5,
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
  const { slug, sessionId } = useParams();

  const [assignedSites, setAssignedSites] = useState(initialAssignedSites);
  const [form, setForm] = useState({
    site: "",
    quota: "",
    alternates: "",
  });

  const totalQuota = assignedSites.reduce((sum, site) => sum + site.quota, 0);
  const totalAlternates = assignedSites.reduce(
    (sum, site) => sum + site.alternates,
    0
  );

  const handleAddSite = (e) => {
    e.preventDefault();

    if (!form.site || !form.quota || !form.alternates) {
      alert("Please fill all fields.");
      return;
    }

    const newSite = {
      id: Date.now(),
      name: form.site,
      subtitle: "New assignment",
      quota: Number(form.quota),
      alternates: Number(form.alternates),
      status: "Active",
    };

    setAssignedSites((prev) => [...prev, newSite]);
    setForm({
      site: "",
      quota: "",
      alternates: "",
    });
  };

  const handleDelete = (id) => {
    setAssignedSites((prev) => prev.filter((site) => site.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm text-[#7A8088]">
              <Link
                to="/dashboard/admin/activities"
                className="text-[#ED8D31] font-medium"
              >
                Manage Activities
              </Link>
              <span className="mx-2">›</span>
              <Link
                to={`/dashboard/admin/activities/${slug}/sessions`}
                className="text-[#ED8D31] font-medium"
              >
                Excursion à Djanet
              </Link>
              <span className="mx-2">›</span>
              <span>Session {sessionId}</span>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">Sites & Quotas</span>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                  Sites & Quotas Configuration
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 leading-[170%]">
                  Assign sites, configure quotas, and define alternates for Session {sessionId}.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/dashboard/admin/activities/${slug}/sessions`}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Cancel
                </Link>

                <button
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  Verify & Save
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Assigned Sites" value={assignedSites.length} subtitle={`For Session ${sessionId}`} />
              <StatCard title="Total Quota" value={totalQuota} subtitle="Places allocated across sites" />
              <StatCard title="Total Alternates" value={totalAlternates} subtitle="Waitlist places available" />
              <StatCard title="Registrations" value="342" subtitle="Currently registered employees" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_340px] gap-6">
              {/* Left table */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC]">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">
                    Assigned Sites
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    Manage the sites and their respective capacities for this session.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Site Name
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Allocated Quota
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Alternates
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
                      {assignedSites.map((site) => (
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

                          <td className="px-5 py-5">
                            <p className="text-sm font-semibold text-[#2F343B]">
                              {site.quota} <span className="font-normal text-[#7A8088]">places</span>
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm font-semibold text-[#2F343B]">
                              {site.alternates} <span className="font-normal text-[#7A8088]">alternates</span>
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4F4DD] text-[#2D7A4A]">
                              {site.status}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex gap-2">
                              <button className="w-9 h-9 rounded-lg border border-[#E5E2DC] bg-white text-[#7A8088]">
                                ✎
                              </button>
                              <button
                                onClick={() => handleDelete(site.id)}
                                className="w-9 h-9 rounded-lg border border-[#F0B1B1] bg-white text-[#D85C5C]"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Right panel */}
              <div className="space-y-6">
                {/* Assign site */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[28px] font-bold text-[#2F343B]">
                    Assign Site
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    Allocate quota to a new site for this session.
                  </p>

                  <form onSubmit={handleAddSite} className="space-y-4">
                    <Field label="Site *">
                      <select
                        value={form.site}
                        onChange={(e) => setForm((prev) => ({ ...prev, site: e.target.value }))}
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
                        value={form.quota}
                        onChange={(e) => setForm((prev) => ({ ...prev, quota: e.target.value }))}
                        placeholder="e.g., 50"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label="Alternates (Suppléants) *">
                      <input
                        type="number"
                        value={form.alternates}
                        onChange={(e) => setForm((prev) => ({ ...prev, alternates: e.target.value }))}
                        placeholder="e.g., 10"
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

                {/* Session details */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[28px] font-bold text-[#2F343B] mb-5">
                    Session Details
                  </h3>

                  <div className="space-y-3">
                    <DetailRow label="Session Name" value={`Session ${sessionId}`} />
                    <DetailRow label="Dates" value="Oct 15 - Oct 30, 2024" />
                    <DetailRow label="Draw Date" value="Oct 10, 2024" />
                    <DetailRow label="Draw Location" value="Oran Regional Office" />
                    <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-[#7A8088]">Status</span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4F4DD] text-[#2D7A4A]">
                        Open
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
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

function DetailRow({ label, value }) {
  return (
    <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B]">{value}</span>
    </div>
  );
}