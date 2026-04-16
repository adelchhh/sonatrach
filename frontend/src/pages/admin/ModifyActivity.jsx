import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link, useParams } from "react-router-dom";

export default function ModifyActivity() {
  const { slug } = useParams();

  const [form, setForm] = useState({
    title: "Excursion à Djanet",
    description:
      "Voyage organisé au sud algérien avec visites guidées, hébergement en pension complète, et découverte des paysages sahariens exceptionnels de la région du Tassili n'Ajjer.",
    category: "Travel activity",
    participationCondition: "Standard Employees & Families",
    minimumSeniority: "5",
    confirmationDeadline: "Oct 10, 2024",
    documentDeadline: "Oct 12, 2024",
    transportation: "Flight (Air Algérie) included",
    catering: "Full Board (Pension Complète)",
    status: "Active",
    requiresDraw: true,
    requiredDocuments: [
      "ID Copy (Carte d'identité)",
      "Medical Certificate",
    ],
  });

  const allDocuments = [
    "ID Copy (Carte d'identité)",
    "Medical Certificate",
    "Family Record Book (Livret de famille)",
    "Passport Copy",
  ];

  const toggleDocument = (doc) => {
    setForm((prev) => {
      const exists = prev.requiredDocuments.includes(doc);

      return {
        ...prev,
        requiredDocuments: exists
          ? prev.requiredDocuments.filter((d) => d !== doc)
          : [...prev.requiredDocuments, doc],
      };
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saved activity:", { slug, ...form });
    alert("Activity changes saved.");
  };

  const handleArchive = () => {
    alert("Activity archived.");
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
              </Link>{" "}
              <span className="mx-2">›</span>
              <span>{form.title}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                    Modify Activity: {form.title}
                  </h1>

                  <span className="px-3 py-1 rounded-full bg-[#D4F4DD] text-[#2D7A4A] text-sm font-semibold">
                    {form.status}
                  </span>
                </div>

                <p className="text-[#7A8088] text-sm leading-[170%]">
                  Update details, conditions, deadlines, and logistics for this activity.
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
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_340px] gap-6">
              {/* Left content */}
              <div className="space-y-6">
                {/* General information */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">
                    General Information
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    Basic details about the activity that employees will see.
                  </p>

                  <div className="space-y-5">
                    <Field label="Activity Title">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label="Description">
                      <textarea
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>

                    <Field label="Category">
                      <select
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option>Travel activity</option>
                        <option>Family stay</option>
                        <option>Wellness stay</option>
                        <option>Corporate event</option>
                      </select>
                    </Field>
                  </div>
                </section>

                {/* Conditions */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">
                    Conditions & Deadlines
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    Rules for participation and important dates for registrations.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Conditions of Participation">
                      <select
                        value={form.participationCondition}
                        onChange={(e) =>
                          handleChange("participationCondition", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option>Standard Employees & Families</option>
                        <option>Employees only</option>
                        <option>Families only</option>
                      </select>
                    </Field>

                    <Field label="Minimum Seniority (Years)">
                      <input
                        type="number"
                        value={form.minimumSeniority}
                        onChange={(e) =>
                          handleChange("minimumSeniority", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label="Confirmation Deadline">
                      <input
                        type="text"
                        value={form.confirmationDeadline}
                        onChange={(e) =>
                          handleChange("confirmationDeadline", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label="Document Submission Deadline">
                      <input
                        type="text"
                        value={form.documentDeadline}
                        onChange={(e) =>
                          handleChange("documentDeadline", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>
                  </div>
                </section>

                {/* Logistics */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">
                    Logistics & Requirements
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    Define transportation, catering, and what employees need to provide.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Field label="Transportation Arrangements">
                      <select
                        value={form.transportation}
                        onChange={(e) =>
                          handleChange("transportation", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option>Flight (Air Algérie) included</option>
                        <option>Bus transportation included</option>
                        <option>No transport included</option>
                      </select>
                    </Field>

                    <Field label="Catering Arrangements">
                      <select
                        value={form.catering}
                        onChange={(e) => handleChange("catering", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option>Full Board (Pension Complète)</option>
                        <option>Half Board</option>
                        <option>No catering</option>
                      </select>
                    </Field>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-[#2F343B] mb-3">
                      Required Documents
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allDocuments.map((doc) => {
                        const selected = form.requiredDocuments.includes(doc);

                        return (
                          <button
                            key={doc}
                            type="button"
                            onClick={() => toggleDocument(doc)}
                            className={`text-left px-4 py-3 rounded-[14px] border text-sm transition-colors ${
                              selected
                                ? "bg-[#ED8D31] text-white border-[#ED8D31]"
                                : "bg-white text-[#2F343B] border-[#E5E2DC]"
                            }`}
                          >
                            {selected ? "✓ " : ""}
                            {doc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm font-medium text-[#2F343B]">
                    <input
                      type="checkbox"
                      checked={form.requiresDraw}
                      onChange={(e) => handleChange("requiresDraw", e.target.checked)}
                      className="w-4 h-4"
                    />
                    Requires a draw (Tirage au sort)
                  </label>
                </section>
              </div>

              {/* Right panel */}
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">
                    Cover Image
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Displayed on the catalog and dashboard.
                  </p>

                  <img
                    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                    alt="Activity cover"
                    className="w-full h-[180px] rounded-[16px] object-cover mb-4"
                  />

                  <button className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] text-sm font-semibold text-[#2F343B] bg-white">
                    Replace Image
                  </button>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">
                    Status Settings
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Control the visibility of this activity.
                  </p>

                  <Field label="Current Status">
                    <select
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                    >
                      <option>Active</option>
                      <option>Closed</option>
                      <option>Draft</option>
                    </select>
                  </Field>

                  <div className="mt-4 rounded-[16px] bg-[#F9F8F6] p-4">
                    <p className="text-sm font-semibold text-[#2F343B]">
                      Activity is Live
                    </p>
                    <p className="text-xs text-[#7A8088] mt-1">
                      Employees can currently register.
                    </p>
                  </div>
                </section>

                <section className="rounded-[24px] border border-[#F0B1B1] bg-white p-5">
                  <h3 className="text-[24px] font-bold text-[#D85C5C]">
                    Danger Zone
                  </h3>

                  <button
                    onClick={handleArchive}
                    className="mt-4 w-full px-4 py-3 rounded-[14px] border border-[#F0B1B1] text-[#D85C5C] text-sm font-semibold bg-white hover:bg-[#FFF7F7] transition-colors"
                  >
                    Archive Activity
                  </button>
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

