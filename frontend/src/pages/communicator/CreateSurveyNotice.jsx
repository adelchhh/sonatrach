import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiPost, getCurrentUserId } from "../../api";

const audiences = [
  "All Employees",
  "Applicants",
  "Participants",
  "Selected Participants",
  "Families",
  "Selected Families",
];

const ctaOptions = [
  "Open Survey",
  "Answer Survey",
  "Participate Now",
  "Share Feedback",
];

export default function CreateSurveyNotice() {
  const userId = getCurrentUserId();
  const [form, setForm] = useState({
    title: "",
    targetAudience: "",
    publishDate: "",
    deadline: "",
    summary: "",
    content: "",
    surveyLink: "",
    estimatedDuration: "",
    ctaLabel: "Open Survey",
    status: "Draft",
    sendNotification: true,
    highlightSurvey: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toAudience = (value) => {
    const map = {
      "All Employees": "ALL",
      Applicants: "EMPLOYEES",
      Participants: "EMPLOYEES",
      "Selected Participants": "EMPLOYEES",
      Families: "EMPLOYEES",
      "Selected Families": "EMPLOYEES",
    };
    return map[value] || "ALL";
  };

  const submitSurvey = async (status) => {
    if (!userId) {
      alert("Please log in first.");
      return;
    }
    if (!form.content.trim()) {
      alert("Please fill in the Full Message.");
      return;
    }

    const payload = {
      user_id: userId,
      title: form.title || null,
      question: form.content.trim(),
      start_date: form.publishDate || new Date().toISOString().slice(0, 10),
      end_date: form.deadline || form.publishDate || new Date().toISOString().slice(0, 10),
      audience: toAudience(form.targetAudience),
      status,
    };

    setSubmitting(true);
    try {
      await apiPost("/surveys", payload);
      alert(status === "PUBLISHED" ? "Survey notice published." : "Survey notice draft saved.");
    } catch (err) {
      alert(err.message || "Could not save survey.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    submitSurvey("DRAFT");
  };

  const handlePublish = () => {
    submitSurvey("PUBLISHED");
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                  Communicator tools
                </p>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Create Survey Notice
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Create a new survey communication with audience targeting,
                  publication settings, and a direct survey access link for employees.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/dashboard/communicator/surveys"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Cancel
                </Link>

                <button
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold hover:bg-[#F8F7F4] transition-colors"
                >
                  Save Draft
                </button>

                <button
                  onClick={handlePublish}
                  disabled={submitting}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  {submitting ? "Submitting..." : "Publish Survey Notice"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
              {/* Left side */}
              <div className="space-y-6">
                {/* Basic information */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Basic Information
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Define the target, timing, and core identity of the survey notice.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label="Survey Title">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="e.g., Winter Activity Satisfaction Survey"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Target Audience">
                        <select
                          value={form.targetAudience}
                          onChange={(e) =>
                            handleChange("targetAudience", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        >
                          <option value="">Select audience</option>
                          {audiences.map((audience) => (
                            <option key={audience}>{audience}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Publish Date">
                        <input
                          type="date"
                          value={form.publishDate}
                          onChange={(e) =>
                            handleChange("publishDate", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        />
                      </Field>

                      <Field label="Survey Deadline">
                        <input
                          type="date"
                          value={form.deadline}
                          onChange={(e) =>
                            handleChange("deadline", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        />
                      </Field>

                      <Field label="Estimated Duration">
                        <input
                          type="text"
                          value={form.estimatedDuration}
                          onChange={(e) =>
                            handleChange("estimatedDuration", e.target.value)
                          }
                          placeholder="e.g., 5 minutes"
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Survey content */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Survey Content
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Write the communication that employees will read before opening the survey.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label="Short Summary">
                      <textarea
                        value={form.summary}
                        onChange={(e) => handleChange("summary", e.target.value)}
                        rows={3}
                        placeholder="Write a short summary shown in survey lists..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>

                    <Field label="Full Message">
                      <textarea
                        value={form.content}
                        onChange={(e) => handleChange("content", e.target.value)}
                        rows={8}
                        placeholder="Write the full survey introduction and explanation..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>
                  </div>
                </section>

                {/* Survey access */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Survey Access
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Define how employees will open and access the survey.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label="Survey Link">
                      <input
                        type="text"
                        value={form.surveyLink}
                        onChange={(e) =>
                          handleChange("surveyLink", e.target.value)
                        }
                        placeholder="e.g., /surveys/winter-satisfaction or external link"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label="Call To Action Label">
                      <select
                        value={form.ctaLabel}
                        onChange={(e) => handleChange("ctaLabel", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        {ctaOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>

                {/* Bottom actions */}
                <div className="flex justify-end gap-3 flex-wrap">
                  <Link
                    to="/dashboard/communicator/surveys"
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                  >
                    Cancel
                  </Link>

                  <button
                    onClick={handleSaveDraft}
                    disabled={submitting}
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold hover:bg-[#F8F7F4] transition-colors"
                  >
                    Save Draft
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={submitting}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                  >
                    {submitting ? "Submitting..." : "Publish Survey Notice"}
                  </button>
                </div>
              </div>

              {/* Right side */}
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Publishing & Status
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Set the publication state of the survey notice.
                    </p>
                  </div>

                  <div className="p-5">
                    <Field label="Survey Notice Status">
                      <select
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option>Draft</option>
                        <option>Published</option>
                        <option>Scheduled</option>
                        <option>Archived</option>
                      </select>
                    </Field>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Additional Options
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Communication preferences for this survey notice.
                    </p>
                  </div>

                  <div className="p-5 space-y-4">
                    <ToggleCard
                      title="Send Notification on Publish"
                      description="Notify the selected audience when the survey notice is published."
                      checked={form.sendNotification}
                      onToggle={() =>
                        handleChange("sendNotification", !form.sendNotification)
                      }
                    />

                    <ToggleCard
                      title="Highlight as Important"
                      description="Mark this survey as a highlighted communication item."
                      checked={form.highlightSurvey}
                      onToggle={() =>
                        handleChange("highlightSurvey", !form.highlightSurvey)
                      }
                    />
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Preview Summary
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Quick view of the survey notice being prepared.
                    </p>
                  </div>

                  <div className="p-5 space-y-3">
                    <SummaryRow label="Title" value={form.title || "Not set"} />
                    <SummaryRow
                      label="Audience"
                      value={form.targetAudience || "Not selected"}
                    />
                    <SummaryRow
                      label="Publish Date"
                      value={form.publishDate || "Not selected"}
                    />
                    <SummaryRow
                      label="Status"
                      value={form.status || "Draft"}
                    />
                    <SummaryRow
                      label="Survey Link"
                      value={form.surveyLink ? "Added" : "Missing"}
                    />
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

function ToggleCard({ title, description, checked, onToggle }) {
  return (
    <div className="rounded-[18px] border border-[#E5E2DC] bg-[#FBFAF8] p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#2F343B]">{title}</p>
        <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-[#ED8D31]" : "bg-[#E5E2DC]"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
            checked ? "left-5" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}
