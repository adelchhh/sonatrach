import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost, apiDelete } from "../../api";

export default function ManageSite() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [pageError, setPageError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const [modal, setModal] = useState({
    open: false,
    siteId: null,
  });

  const selectedSite = sites.find((site) => site.id === modal.siteId);

  const loadSites = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/sites")
      .then((res) => {
        setSites(res.data || []);
      })
      .catch((err) => {
        setPageError(err.message || "Failed to load sites");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleAddSite = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("Site name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/sites", {
        name: form.name.trim(),
        address: form.address.trim() || null,
      });
      setForm({ name: "", address: "" });
      loadSites();
    } catch (err) {
      setFormError(err.message || "Could not create site.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModal({ open: false, siteId: null });
  };

  const handleDeleteSite = async () => {
    try {
      await apiDelete(`/sites/${modal.siteId}`);
      closeModal();
      loadSites();
    } catch (err) {
      alert(err.message || "Could not delete site.");
      closeModal();
    }
  };

  const totalSites = sites.length;
  const totalActivities = sites.reduce(
    (sum, s) => sum + Number(s.activities_count || 0),
    0
  );
  const totalSessions = sites.reduce(
    (sum, s) => sum + Number(s.sessions_count || 0),
    0
  );
  const sitesInUse = sites.filter(
    (s) => Number(s.sessions_count || 0) > 0
  ).length;

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
                  Admin tools
                </p>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Manage Sites
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[720px] leading-[170%]">
                  Manage the available sites used to organize activities and sessions.
                  Add new sites, review activity distribution, and remove unused ones.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total sites" value={totalSites} />
                <StatCard label="Sites in use" value={sitesInUse} />
                <StatCard label="Activities linked" value={totalActivities} />
                <StatCard label="Sessions linked" value={totalSessions} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                {/* Sites list */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E5E2DC]">
                    <h2 className="text-[22px] font-bold text-[#2F343B]">
                      Existing Sites
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Review current sites and their linked activity volume.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr className="text-left bg-[#F9F8F6]">
                          <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                            Site
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                            Address
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                            Activities
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                            Sessions
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading && (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-10 text-center text-sm text-[#7A8088]"
                            >
                              Loading sites...
                            </td>
                          </tr>
                        )}

                        {!loading && sites.length === 0 && (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No sites available yet.
                            </td>
                          </tr>
                        )}

                        {!loading &&
                          sites.map((site) => (
                            <tr
                              key={site.id}
                              className="border-t border-[#E5E2DC] hover:bg-[#FCFBF9]"
                            >
                              <td className="px-6 py-4">
                                <p className="font-semibold text-[#2F343B] text-sm">
                                  {site.name}
                                </p>
                              </td>

                              <td className="px-6 py-4 text-sm text-[#7A8088]">
                                {site.address || "—"}
                              </td>

                              <td className="px-6 py-4 text-sm text-[#2F343B] font-medium">
                                {site.activities_count}
                              </td>

                              <td className="px-6 py-4 text-sm text-[#2F343B] font-medium">
                                {site.sessions_count}
                              </td>

                              <td className="px-6 py-4">
                                <button
                                  onClick={() =>
                                    setModal({
                                      open: true,
                                      siteId: site.id,
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm font-medium text-[#C95454] hover:bg-[#FFF5F5] transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Add site form */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6 h-fit">
                  <h2 className="text-[22px] font-bold text-[#2F343B] mb-2">
                    Add New Site
                  </h2>
                  <p className="text-sm text-[#7A8088] mb-5 leading-[170%]">
                    Create a new site that can later be linked to activities, sessions,
                    and registration quotas.
                  </p>

                  <form onSubmit={handleAddSite} className="space-y-4">
                    {formError && (
                      <div className="rounded-[12px] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                        {formError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Site name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Ex: Algiers Center"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm text-[#2F343B] placeholder:text-[#7A8088] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder="Ex: Oran"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm text-[#2F343B] placeholder:text-[#7A8088] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white font-semibold text-sm hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Adding..." : "Add Site"}
                    </button>
                  </form>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {modal.open && selectedSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Delete Site
            </h2>

            <p className="text-sm text-[#7A8088] mb-6 leading-[170%]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#2F343B]">
                {selectedSite.name}
              </span>
              ? This action cannot be undone.
              {Number(selectedSite.sessions_count) > 0 && (
                <>
                  <br />
                  <span className="text-red-600 font-medium">
                    Warning: this site is used by {selectedSite.sessions_count}{" "}
                    session(s) and cannot be deleted while in use.
                  </span>
                </>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteSite}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088] mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-[#2F343B]">{value}</p>
    </div>
  );
}
