import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiGet, apiPost, getCurrentUserId } from "../api";
import { useT } from "../i18n/LanguageContext";

const defaultImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

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

export default function ActivityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const t = useT();

  const [activity, setActivity] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [siteChoices, setSiteChoices] = useState([]);

  const [modal, setModal] = useState({ open: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const userId = getCurrentUserId();
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  useEffect(() => {
    setLoading(true);
    setPageError(null);
    Promise.all([
      apiGet(`/activities/${slug}`),
      apiGet(`/activities/${slug}/open-sessions`),
    ])
      .then(([actRes, sessRes]) => {
        setActivity(actRes.data);
        const sessList = sessRes.data || [];
        setSessions(sessList);
        if (sessList.length > 0) setSelectedSessionId(sessList[0].id);
      })
      .catch((err) => setPageError(err.message || "Could not load activity."))
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleSiteChoice = (sessionSiteId) => {
    setSiteChoices((prev) => {
      if (prev.includes(sessionSiteId)) {
        return prev.filter((id) => id !== sessionSiteId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, sessionSiteId];
    });
  };

  const moveChoice = (index, direction) => {
    const newOrder = [...siteChoices];
    const swap = index + direction;
    if (swap < 0 || swap >= newOrder.length) return;
    [newOrder[index], newOrder[swap]] = [newOrder[swap], newOrder[index]];
    setSiteChoices(newOrder);
  };

  const handleConfirm = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (!selectedSessionId) {
      setSubmitError("Please choose a session.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiPost(`/sessions/${selectedSessionId}/register`, {
        user_id: userId,
        site_choices: siteChoices,
      });
      setSuccessMessage(res.message || "Registration submitted!");
      setModal({ open: false });
      setSiteChoices([]);
    } catch (err) {
      setSubmitError(err.message || "Could not submit registration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-16">
          <div className="max-w-[1336px] mx-auto">
            <p className="text-[#7A8088]">Loading activity...</p>
            <Link to="/catalog" className="text-[#ED8D31] font-medium">
              Back to catalog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (pageError || !activity) {
    return (
      <Layout>
        <div className="px-4 py-16">
          <div className="max-w-[1336px] mx-auto">
            <p className="text-red-600">
              {pageError || "Activity not found."}
            </p>
            <Link to="/catalog" className="text-[#ED8D31] font-medium">
              Back to catalog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const image = activity.image_url || activity.image || defaultImage;

  return (
    <Layout>
      <div className="px-4 py-10">
        <div className="w-full max-w-[1336px] mx-auto">
          <div className="text-sm text-[#7A8088] mb-5">
            <Link to="/catalog" className="hover:text-[#2F343B]">
              Activities
            </Link>{" "}
            · <span className="text-[#2F343B]">{activity.title}</span>
          </div>

          <div className="mb-8">
            <span className="inline-flex px-4 py-2 rounded-full bg-white border border-[#E5E2DC] text-sm text-[#50565E] mb-4">
              {activity.category}
            </span>

            <h1 className="text-[#2F343B] text-[56px] font-extrabold leading-[100%] tracking-[-2px] mb-4">
              {activity.title}
            </h1>

            <p className="text-[#7A8088] text-xl">
              {activity.description}
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 rounded-[14px] border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
              ✅ {successMessage}{" "}
              <Link
                to="/dashboard/requests"
                className="font-semibold underline ml-2"
              >
                See my requests
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-10">
            <div className="rounded-[28px] overflow-hidden min-h-[420px]">
              <img
                src={image}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="rounded-[28px] border border-[#E5E2DC] bg-white p-7 h-fit">
              <span className="inline-flex px-4 py-2 rounded-full bg-[#E9F7EF] text-[#2F8C57] text-sm font-semibold mb-5">
                {activity.status}
              </span>

              <h2 className="text-[#2F343B] text-[22px] font-bold mb-4">
                Register for a session
              </h2>

              <div className="space-y-3 text-sm text-[#50565E] border-b border-[#E5E2DC] pb-5 mb-5">
                <div className="flex justify-between">
                  <span>Minimum seniority</span>
                  <span className="font-semibold text-[#2F343B]">
                    {activity.minimum_seniority} year(s)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Demand level</span>
                  <span className="font-semibold text-[#2F343B]">
                    {activity.demand_level || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Random draw</span>
                  <span className="font-semibold text-[#2F343B]">
                    {activity.draw_enabled ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {sessions.length === 0 ? (
                <p className="text-sm text-[#7A8088] italic">
                  No sessions are currently open for this activity.
                </p>
              ) : (
                <>
                  <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                    Select Session
                  </label>

                  <select
                    value={selectedSessionId || ""}
                    onChange={(e) => {
                      setSelectedSessionId(Number(e.target.value));
                      setSiteChoices([]);
                    }}
                    className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none mb-5"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {formatDate(s.start_date)} → {formatDate(s.end_date)} (
                        {s.total_quota} places)
                      </option>
                    ))}
                  </select>

                  {selectedSession && selectedSession.sites?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-[#2F343B] mb-2">
                        Site preferences (optional)
                      </p>
                      <p className="text-xs text-[#7A8088] mb-3">
                        Pick up to 3 sites in order of preference. The draw will
                        try your 1st choice first.
                      </p>

                      <div className="space-y-2 mb-3">
                        {siteChoices.length === 0 ? (
                          <p className="text-xs text-[#7A8088] italic">
                            No site selected yet.
                          </p>
                        ) : (
                          siteChoices.map((id, idx) => {
                            const site = selectedSession.sites.find(
                              (s) => s.session_site_id === id
                            );
                            return (
                              <div
                                key={id}
                                className="flex items-center justify-between bg-[#FFF7EC] border border-[#F3D9B0] rounded-lg px-3 py-2 text-sm"
                              >
                                <span>
                                  <strong>#{idx + 1}</strong> {site?.site_name}
                                </span>
                                <span className="flex gap-1">
                                  <button
                                    onClick={() => moveChoice(idx, -1)}
                                    className="px-2 py-0.5 text-xs bg-white border rounded"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => moveChoice(idx, 1)}
                                    className="px-2 py-0.5 text-xs bg-white border rounded"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    onClick={() => toggleSiteChoice(id)}
                                    className="px-2 py-0.5 text-xs bg-white border rounded text-red-600"
                                  >
                                    ✕
                                  </button>
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedSession.sites
                          .filter(
                            (s) => !siteChoices.includes(s.session_site_id)
                          )
                          .map((s) => (
                            <button
                              key={s.session_site_id}
                              onClick={() =>
                                toggleSiteChoice(s.session_site_id)
                              }
                              disabled={siteChoices.length >= 3}
                              className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] disabled:opacity-50"
                            >
                              + {s.site_name} ({s.quota})
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!userId) {
                        navigate("/login");
                        return;
                      }
                      setModal({ open: true });
                    }}
                    className="w-full py-4 rounded-[14px] bg-[#ED8D31] text-white font-semibold hover:bg-[#d97d26] transition-colors"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-[#2F343B] text-[36px] font-bold mb-4">
              Overview
            </h2>
            <p className="text-[#7A8088] text-base leading-[190%] mb-8">
              {activity.description}
            </p>

            <h3 className="text-[#2F343B] text-[30px] font-bold mb-5">
              Available sessions
            </h3>

            {sessions.length === 0 ? (
              <div className="rounded-[20px] border border-[#E5E2DC] bg-white p-5 text-[#7A8088]">
                No sessions available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-[20px] border border-[#E5E2DC] bg-white p-5 flex gap-5 items-start"
                  >
                    <div className="min-w-[120px] text-[#ED8D31] font-bold">
                      {formatDate(s.start_date)}
                      <p className="text-xs text-[#7A8088] font-normal mt-1">
                        → {formatDate(s.end_date)}
                      </p>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-[#2F343B] font-bold mb-2">
                        Session #{s.id}
                      </h4>
                      <p className="text-[#7A8088] text-sm leading-[170%]">
                        Registration deadline:{" "}
                        <strong>{formatDate(s.registration_deadline)}</strong> ·{" "}
                        Quota: <strong>{s.total_quota}</strong> places ·{" "}
                        Transport: {s.transport_included ? "✅" : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModal({ open: false })}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Confirm Registration
            </h2>

            <p className="text-sm text-[#7A8088] mb-3 leading-[170%]">
              Submit your request for{" "}
              <span className="font-semibold text-[#2F343B]">
                {activity.title}
              </span>
              {selectedSession && (
                <>
                  {" "}— session {formatDate(selectedSession.start_date)} →{" "}
                  {formatDate(selectedSession.end_date)}.
                </>
              )}
            </p>

            {siteChoices.length > 0 && (
              <p className="text-xs text-[#7A8088] mb-4">
                Site preferences: {siteChoices.length} selected.
              </p>
            )}

            {submitError && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm mb-4">
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false })}
                disabled={submitting}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
