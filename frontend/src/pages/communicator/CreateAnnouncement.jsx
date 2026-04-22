import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const categories = [
  "Campaign",
  "Information",
  "Results",
  "Reminder",
  "Event",
];

const audiences = [
  "All Employees",
  "Applicants",
  "Selected Participants",
  "Families",
  "Selected Families",
];

export default function CreateAnnouncement() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    audience: "",
    publishDate: "",
    summary: "",
    content: "",
    status: "Draft",
    hasDocument: false,
    documentTitle: "",
    documentName: "",
    documentNote: "",
    sendNotification: true,
    highlightAnnouncement: false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveDraft = () => {
    const payload = {
      ...form,
      status: "Draft",
    };

    console.log("Save announcement draft:", payload);
    alert("Announcement draft saved.");
  };

  const handlePublish = () => {
    const payload = {
      ...form,
      status: "Published",
    };

    console.log("Publish announcement:", payload);
    alert("Announcement published.");
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
                  Create Announcement
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Create a new employee-facing announcement with content,
                  audience targeting, publication settings, and an optional
                  official document attachment.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/dashboard/communicator/announcements"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Cancel
                </Link>

                <button
                  onClick={handleSaveDraft}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold hover:bg-[#F8F7F4] transition-colors"
                >
                  Save Draft
                </button>

                <button
                  onClick={handlePublish}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  Publish Announcement
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
                      Define the main identity and visibility of the announcement.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label="Announcement Title">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="e.g., Winter Activities Registration Open"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Category">
                        <select
                          value={form.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Audience">
                        <select
                          value={form.audience}
                          onChange={(e) => handleChange("audience", e.target.value)}
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
                    </div>
                  </div>
                </section>

                {/* Announcement content */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Announcement Content
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Write the summary and the full message visible to employees.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label="Short Summary">
                      <textarea
                        value={form.summary}
                        onChange={(e) => handleChange("summary", e.target.value)}
                        rows={3}
                        placeholder="Write a short summary that appears in announcement lists..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>

                    <Field label="Full Content">
                      <textarea
                        value={form.content}
                        onChange={(e) => handleChange("content", e.target.value)}
                        rows={8}
                        placeholder="Write the full announcement content..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>
                  </div>
                </section>

                {/* Official document */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Official Document Attachment
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Attach an optional official document if the announcement requires one.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="rounded-[18px] border border-[#E5E2DC] bg-[#FBFAF8] p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#2F343B]">
                          Attach Official Document
                        </p>
                        <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">
                          Enable this if employees need to read or download an official file.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleChange("hasDocument", !form.hasDocument)
                        }
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          form.hasDocument ? "bg-[#ED8D31]" : "bg-[#E5E2DC]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            form.hasDocument ? "left-5" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {form.hasDocument && (
                      <div className="space-y-5">
                        <Field label="Document Title">
                          <input
                            type="text"
                            value={form.documentTitle}
                            onChange={(e) =>
                              handleChange("documentTitle", e.target.value)
                            }
                            placeholder="e.g., Official Registration Notice"
                            className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                          />
                        </Field>

                        <div>
                          <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                            Upload File
                          </label>

                          <div className="rounded-[18px] border border-dashed border-[#D9D5CE] bg-[#FBFAF8] h-[160px] flex flex-col items-center justify-center text-center px-6">
                            <div className="w-10 h-10 rounded-full bg-[#F1F0EC] flex items-center justify-center mb-4 text-[#7A8088]">
                              ⬆
                            </div>
                            <p className="text-sm text-[#2F343B] font-medium">
                              <span className="text-[#ED8D31]">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1">
                              PDF, DOCX, PNG or JPG
                            </p>
                          </div>

                          <input
                            type="text"
                            value={form.documentName}
                            onChange={(e) =>
                              handleChange("documentName", e.target.value)
                            }
                            placeholder="Uploaded file name..."
                            className="w-full mt-3 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                          />
                        </div>

                        <Field label="Document Note">
                          <textarea
                            value={form.documentNote}
                            onChange={(e) =>
                              handleChange("documentNote", e.target.value)
                            }
                            rows={3}
                            placeholder="Optional note shown with the attached official document..."
                            className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                </section>

                {/* Bottom actions */}
                <div className="flex justify-end gap-3 flex-wrap">
                  <Link
                    to="/dashboard/communicator/announcements"
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                  >
                    Cancel
                  </Link>

                  <button
                    onClick={handleSaveDraft}
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold hover:bg-[#F8F7F4] transition-colors"
                  >
                    Save Draft
                  </button>

                  <button
                    onClick={handlePublish}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                  >
                    Publish Announcement
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
                      Set the publication state of the announcement.
                    </p>
                  </div>

                  <div className="p-5">
                    <Field label="Announcement Status">
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
                      Communication settings for the announcement.
                    </p>
                  </div>

                  <div className="p-5 space-y-4">
                    <ToggleCard
                      title="Send Notification on Publish"
                      description="Notify the targeted audience when the announcement is published."
                      checked={form.sendNotification}
                      onToggle={() =>
                        handleChange("sendNotification", !form.sendNotification)
                      }
                    />

                    <ToggleCard
                      title="Highlight as Important"
                      description="Mark this announcement as an important communication item."
                      checked={form.highlightAnnouncement}
                      onToggle={() =>
                        handleChange(
                          "highlightAnnouncement",
                          !form.highlightAnnouncement
                        )
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
                      Quick view of the announcement being prepared.
                    </p>
                  </div>

                  <div className="p-5 space-y-3">
                    <SummaryRow label="Title" value={form.title || "Not set"} />
                    <SummaryRow
                      label="Category"
                      value={form.category || "Not selected"}
                    />
                    <SummaryRow
                      label="Audience"
                      value={form.audience || "Not selected"}
                    />
                    <SummaryRow
                      label="Status"
                      value={form.status || "Draft"}
                    />
                    <SummaryRow
                      label="Document"
                      value={form.hasDocument ? "Attached" : "No document"}
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