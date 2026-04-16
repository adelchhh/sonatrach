import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialIdeas = [
  {
    id: 1,
    title: "Weekend hiking program",
    category: "Outdoor",
    description:
      "It would be great to organize monthly hiking weekends for employees and families.",
    submittedOn: "Oct 10, 2024",
    status: "Pending",
  },
  {
    id: 2,
    title: "More family seaside stays",
    category: "Family",
    description:
      "Add more coastal destinations with longer stay options during summer.",
    submittedOn: "Sep 28, 2024",
    status: "Reviewed",
  },
  {
    id: 3,
    title: "Employee sports tournament",
    category: "Sport",
    description:
      "A multi-site tournament could improve engagement and friendly competition.",
    submittedOn: "Sep 15, 2024",
    status: "Approved",
  },
];

export default function IdeaBox() {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [form, setForm] = useState({
    title: "",
    category: "Outdoor",
    description: "",
  });

  const pending = ideas.filter((idea) => idea.status === "Pending").length;
  const reviewed = ideas.filter((idea) => idea.status === "Reviewed").length;
  const approved = ideas.filter((idea) => idea.status === "Approved").length;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      alert("Please fill in the title and description.");
      return;
    }

    const newIdea = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      description: form.description,
      submittedOn: "Today",
      status: "Pending",
    };

    setIdeas((prev) => [newIdea, ...prev]);
    setForm({
      title: "",
      category: "Outdoor",
      description: "",
    });
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Idea Box
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Share your ideas for new activities, destinations, or improvements
                to the employee experience.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Pending"
                value={pending}
                subtitle="Ideas waiting for review"
              />
              <StatCard
                title="Reviewed"
                value={reviewed}
                subtitle="Ideas checked by moderators"
              />
              <StatCard
                title="Approved"
                value={approved}
                subtitle="Ideas accepted for future planning"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-6">
              {/* Form */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5 h-fit">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Submit a New Idea
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-5">
                  Suggest a new activity, destination, or service improvement.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Field label="Idea Title">
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Ex: Weekend desert trip"
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                    />
                  </Field>

                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                    >
                      <option>Outdoor</option>
                      <option>Family</option>
                      <option>Sport</option>
                      <option>Travel</option>
                      <option>Wellness</option>
                      <option>Other</option>
                    </select>
                  </Field>

                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={5}
                      placeholder="Describe your suggestion..."
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                    />
                  </Field>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                  >
                    Submit Idea
                  </button>
                </form>
              </section>

              {/* Ideas list */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                  <div>
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      My Submitted Ideas
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Track the status of your past suggestions.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                    {ideas.length} ideas
                  </span>
                </div>

                <div className="divide-y divide-[#E5E2DC]">
                  {ideas.map((idea) => (
                    <div key={idea.id} className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                              {idea.category}
                            </span>
                            <StatusBadge status={idea.status} />
                          </div>

                          <h3 className="text-[20px] font-bold text-[#2F343B] leading-[120%]">
                            {idea.title}
                          </h3>
                        </div>

                        <span className="text-xs text-[#7A8088] whitespace-nowrap">
                          {idea.submittedOn}
                        </span>
                      </div>

                      <p className="text-sm text-[#7A8088] leading-[170%] mb-4">
                        {idea.description}
                      </p>

                      <button className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-medium">
                        View details
                      </button>
                    </div>
                  ))}
                </div>
              </section>
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

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-[#FFF4D6] text-[#B98900]",
    Reviewed: "bg-[#F1F0EC] text-[#7A8088]",
    Approved: "bg-[#D4F4DD] text-[#2D7A4A]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}