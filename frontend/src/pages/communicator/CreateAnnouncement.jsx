import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiPost, getCurrentUserId } from "../../api";

const TYPES = ["OFFICIAL", "GENERAL", "REMINDER", "EVENT", "HEALTH", "SOCIAL", "SURVEY"];
const AUDIENCES = [
  { value: "ALL", label: "All users" },
  { value: "EMPLOYEES", label: "Employees only" },
  { value: "FUNCTIONAL_ADMIN", label: "Functional admins" },
  { value: "COMMUNICATOR", label: "Communicators" },
  { value: "SYSTEM_ADMIN", label: "System admins" },
];

export default function CreateAnnouncement() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    audience: "ALL",
    attachment_url: "",
    status: "DRAFT",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e, publishNow = false) => {
    e?.preventDefault?.();
    setError(null);

    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/admin/announcements", {
        user_id: userId,
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        audience: form.audience,
        attachment_url: form.attachment_url.trim() || null,
        status: publishNow ? "PUBLISHED" : form.status,
      });
      navigate("/dashboard/communicator/announcements");
    } catch (err) {
      setError(err.message || "Could not create announcement.");
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
          <div className="space-y-6 max-w-[900px]">
            <div className="text-sm text-[#7A8088]">
              <Link
                to="/dashboard/communicator/announcements"
                className="text-[#ED8D31] font-medium"
              >
                Announcements
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">New announcement</span>
            </div>

            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Create announcement
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Compose a new official note. Save as draft to review later, or
                publish immediately to make it visible.
              </p>
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5 space-y-4">
                <Field label="Title *">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g., Winter activities are now open"
                    className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />
                </Field>

                <Field label="Content *">
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, content: e.target.value }))
                    }
                    rows={8}
                    placeholder="Write the body of the announcement..."
                    className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Type">
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, type: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Audience">
                    <select
                      value={form.audience}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, audience: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                    >
                      {AUDIENCES.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Attachment URL (optional)">
                  <input
                    type="text"
                    value={form.attachment_url}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, attachment_url: e.target.value }))
                    }
                    placeholder="https://... (link to PDF, image, etc.)"
                    className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />
                </Field>
              </section>

              <div className="flex justify-end gap-3">
                <Link
                  to="/dashboard/communicator/announcements"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold disabled:opacity-60"
                >
                  Save as draft
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={submitting}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Publish now"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
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
