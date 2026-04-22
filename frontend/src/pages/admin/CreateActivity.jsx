import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

export default function CreateActivity() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    minimumSeniority: "",
    requiresDraw: true,
    numberOfSuppliants: 2,
    status: "Draft",
    printRunRequired: true,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    alert("New activity saved.");
    console.log("Create activity:", form);
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
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Create New Activity
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Define the main information of the activity before configuring
                  sessions, sites, deadlines, and quotas.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/dashboard/admin/activities"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Cancel
                </Link>

                <button
                  onClick={handleSave}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  Save Activity
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
                      General details and media for the activity.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label="Activity Title">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="e.g., Summer Camp for Kids 2024"
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label="Description">
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        rows={5}
                        placeholder="Provide a detailed description of the activity..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Cover Image
                      </label>

                      <div className="rounded-[18px] border border-dashed border-[#D9D5CE] bg-[#FBFAF8] h-[170px] flex flex-col items-center justify-center text-center px-6">
                        <div className="w-10 h-10 rounded-full bg-[#F1F0EC] flex items-center justify-center mb-4 text-[#7A8088]">
                          ⬆
                        </div>
                        <p className="text-sm text-[#2F343B] font-medium">
                          <span className="text-[#ED8D31]">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-[#7A8088] mt-1">
                          SVG, PNG, JPG or GIF (max. 800×400px)
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Activity rules */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Activity Rules
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Define the activity-level rules before creating sessions.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Minimum Seniority (Years)">
                        <select
                          value={form.minimumSeniority}
                          onChange={(e) =>
                            handleChange("minimumSeniority", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        >
                          <option value="">Select option</option>
                          <option value="1">1 year</option>
                          <option value="3">3 years</option>
                          <option value="5">5 years</option>
                          <option value="10">10 years</option>
                        </select>
                      </Field>

                      <Field label="Requires Draw">
                        <select
                          value={form.requiresDraw ? "Yes" : "No"}
                          onChange={(e) =>
                            handleChange(
                              "requiresDraw",
                              e.target.value === "Yes"
                            )
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </Field>
                    </div>

                    {form.requiresDraw && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Number of Suppliants">
                          <input
                            type="number"
                            min="1"
                            value={form.numberOfSuppliants}
                            onChange={(e) =>
                              handleChange(
                                "numberOfSuppliants",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                </section>

                {/* Bottom actions */}
                <div className="flex justify-end gap-3">
                  <Link
                    to="/dashboard/admin/activities"
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                  >
                    Cancel
                  </Link>

                  <button
                    onClick={handleSave}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                  >
                    Save Activity
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
                      Set the current status of the activity.
                    </p>
                  </div>

                  <div className="p-5">
                    <Field label="Activity Status">
                      <select
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option>Draft</option>
                        <option>Active</option>
                        <option>Closed</option>
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
                      Extra configuration settings.
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="rounded-[18px] border border-[#E5E2DC] bg-[#FBFAF8] p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#2F343B]">
                          Print Run Required
                        </p>
                        <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">
                          Requires physical printed materials such as badges,
                          tickets, or access passes.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            "printRunRequired",
                            !form.printRunRequired
                          )
                        }
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          form.printRunRequired
                            ? "bg-[#ED8D31]"
                            : "bg-[#E5E2DC]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            form.printRunRequired ? "left-5" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Preview Summary
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Quick overview of the activity configuration.
                    </p>
                  </div>

                  <div className="p-5 space-y-3">
                    <SummaryRow label="Title" value={form.title || "Not set"} />
                    <SummaryRow
                      label="Minimum Seniority"
                      value={
                        form.minimumSeniority
                          ? `${form.minimumSeniority} year(s)`
                          : "Not set"
                      }
                    />
                    <SummaryRow
                      label="Requires Draw"
                      value={form.requiresDraw ? "Yes" : "No"}
                    />
                    {form.requiresDraw && (
                      <SummaryRow
                        label="Suppliants"
                        value={String(form.numberOfSuppliants)}
                      />
                    )}
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