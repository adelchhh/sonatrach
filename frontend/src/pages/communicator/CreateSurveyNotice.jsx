import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost, getCurrentUserId } from "../../api";

const AUDIENCES = [
  { value: "ALL", label: "All users" },
  { value: "EMPLOYEES", label: "Employees only" },
  { value: "FUNCTIONAL_ADMIN", label: "Functional admins" },
  { value: "COMMUNICATOR", label: "Communicators" },
  { value: "SYSTEM_ADMIN", label: "System admins" },
];

export default function CreateSurveyNotice() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    title: "",
    question: "",
    activity_id: "",
    start_date: "",
    end_date: "",
    required: false,
    audience: "ALL",
    status: "DRAFT",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet("/activities")
      .then((res) => setActivities(res.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e, publishNow = false) => {
    e?.preventDefault?.();
    setError(null);

    if (!form.question.trim() || !form.start_date || !form.end_date) {
      setError("Question, start date and end date are required.");
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError("End date must be after start date.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/admin/surveys", {
        user_id: userId,
        activity_id: form.activity_id ? Number(form.activity_id) : null,
        title: form.title.trim() || null,
        question: form.question.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        required: form.required,
        audience: form.audience,
        status: publishNow ? "PUBLISHED" : form.status,
      });
      navigate("/dashboard/communicator/surveys");
    } catch (err) {
      setError(err.message || "Could not create survey.");
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
                to="/dashboard/communicator/surveys"
                className="text-[#ED8D31] font-medium"
              >
                Surveys
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">New survey</span>
            </div>

            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Create survey
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Define one open question. Employees will see published surveys
                in their dashboard.
              </p>
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5 space-y-4">
                <Field label="Title (optional)">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g., Q4 satisfaction"
                    className="input"
                  />
                </Field>

                <Field label="Question *">
                  <textarea
                    value={form.question}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, question: e.target.value }))
                    }
                    rows={4}
                    placeholder="What would you like to ask employees?"
                    className="input resize-none"
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Linked activity (optional)">
                    <select
                      value={form.activity_id}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, activity_id: e.target.value }))
                      }
                      className="input"
                    >
                      <option value="">— None —</option>
                      {activities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
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
                      className="input"
                    >
                      {AUDIENCES.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Start date *">
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, start_date: e.target.value }))
                      }
                      className="input"
                    />
                  </Field>

                  <Field label="End date *">
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, end_date: e.target.value }))
                      }
                      className="input"
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.required}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, required: e.target.checked }))
                    }
                  />
                  <span className="text-sm text-[#2F343B] font-medium">
                    Required (employees must answer)
                  </span>
                </label>
              </section>

              <div className="flex justify-end gap-3">
                <Link
                  to="/dashboard/communicator/surveys"
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

            <style>{`
              .input {
                width: 100%;
                padding: 0.75rem 1rem;
                border-radius: 14px;
                border: 1px solid #E5E2DC;
                background: #F7F7F5;
                font-size: 0.875rem;
                outline: none;
              }
            `}</style>
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
