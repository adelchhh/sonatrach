import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

export default function EditSession() {
  const { id, sessionId } = useParams();

  // Replace later with real activity data
  const activityRequiresDraw = true;

  const [form, setForm] = useState({
    startDate: "2024-10-15",
    endDate: "2024-10-30",
    registrationDeadline: "2024-10-10",
    drawDate: "2024-10-12",
    drawLocation: "Oran Regional Office",
    confirmationDelay: "3",
    documentUploadDeadline: "2024-10-18",
    transportCovered: true,
    telefaxDocumentName: "session_notice_oran.pdf",
    status: "Open",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert(`Session ${sessionId} updated`);
    console.log("Edit session:", form);
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
              <span className="text-[#2F343B] font-medium">Edit Session</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Edit Session
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Update the session schedule, draw configuration, participation
                  deadlines, and supporting options.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/dashboard/admin/activities/${id}/sessions`}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Cancel
                </Link>

                <button
                  onClick={handleSave}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
              {/* Left side */}
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Session Dates
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Update the main schedule and deadlines of this session.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Start Date">
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => handleChange("startDate", e.target.value)}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                      </Field>

                      <Field label="End Date">
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => handleChange("endDate", e.target.value)}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                      </Field>

                      <Field label="Registration Deadline">
                        <input
                          type="date"
                          value={form.registrationDeadline}
                          onChange={(e) =>
                            handleChange("registrationDeadline", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                      </Field>

                      <Field label="Document Upload Deadline">
                        <input
                          type="date"
                          value={form.documentUploadDeadline}
                          onChange={(e) =>
                            handleChange("documentUploadDeadline", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                      </Field>
                    </div>

                    <Field label="Confirmation Delay (days)">
                      <input
                        type="number"
                        min="0"
                        value={form.confirmationDelay}
                        onChange={(e) =>
                          handleChange("confirmationDelay", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      />
                    </Field>
                  </div>
                </section>

                {activityRequiresDraw && (
                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#E5E2DC]">
                      <h2 className="text-[24px] font-bold text-[#2F343B]">
                        Draw Settings
                      </h2>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Update the draw information for this session.
                      </p>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Draw Date">
                          <input
                            type="date"
                            value={form.drawDate}
                            onChange={(e) => handleChange("drawDate", e.target.value)}
                            className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                          />
                        </Field>

                        <Field label="Draw Location">
                          <input
                            type="text"
                            value={form.drawLocation}
                            onChange={(e) =>
                              handleChange("drawLocation", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </section>
                )}

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Logistics & Documents
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Update transport support and supporting session documents.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <ToggleCard
                      title="Transport Covered"
                      description="Enable this if transportation is provided for this session."
                      checked={form.transportCovered}
                      onToggle={() =>
                        handleChange("transportCovered", !form.transportCovered)
                      }
                    />

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Telefax / Session Document
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
                        value={form.telefaxDocumentName}
                        onChange={(e) =>
                          handleChange("telefaxDocumentName", e.target.value)
                        }
                        className="w-full mt-3 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </div>
                  </div>
                </section>

                <div className="flex justify-end gap-3">
                  <Link
                    to={`/dashboard/admin/activities/${id}/sessions`}
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                  >
                    Cancel
                  </Link>

                  <button
                    onClick={handleSave}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Right side */}
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Session Status
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Set the current status of the session.
                    </p>
                  </div>

                  <div className="p-5">
                    <Field label="Status">
                      <select
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      >
                        <option>Draft</option>
                        <option>Open</option>
                        <option>Closed</option>
                      </select>
                    </Field>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Preview Summary
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Quick overview of this session configuration.
                    </p>
                  </div>

                  <div className="p-5 space-y-3">
                    <SummaryRow label="Start" value={form.startDate || "Not set"} />
                    <SummaryRow label="End" value={form.endDate || "Not set"} />
                    <SummaryRow
                      label="Registration Deadline"
                      value={form.registrationDeadline || "Not set"}
                    />
                    <SummaryRow
                      label="Docs Deadline"
                      value={form.documentUploadDeadline || "Not set"}
                    />
                    <SummaryRow
                      label="Transport"
                      value={form.transportCovered ? "Covered" : "Not covered"}
                    />
                    <SummaryRow label="Status" value={form.status} />
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