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
    note: "Your idea has been received and is waiting for moderator review.",
  },
  {
    id: 2,
    title: "More family seaside stays",
    category: "Family",
    description:
      "Add more coastal destinations with longer stay options during summer.",
    submittedOn: "Sep 28, 2024",
    status: "Reviewed",
    note: "This idea has been reviewed and may be considered for future planning.",
  },
  {
    id: 3,
    title: "Employee sports tournament",
    category: "Sport",
    description:
      "A multi-site tournament could improve engagement and friendly competition.",
    submittedOn: "Sep 15, 2024",
    status: "Approved",
    note: "This idea was approved and may be included in a future campaign.",
  },
];

export default function IdeaBox() {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [successModal, setSuccessModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Outdoor",
    description: "",
  });

  const [modal, setModal] = useState({
    open: false,
    ideaId: null,
  });

  const selectedIdea = ideas.find((idea) => idea.id === modal.ideaId);

  const pending = ideas.filter((idea) => idea.status === "Pending").length;
  const reviewed = ideas.filter((idea) => idea.status === "Reviewed").length;
  const approved = ideas.filter((idea) => idea.status === "Approved").length;

  const closeModal = () => {
    setModal({
      open: false,
      ideaId: null,
    });
  };

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
      note: "Your idea has been submitted successfully and is waiting for review.",
    };
  
    setIdeas((prev) => [newIdea, ...prev]);
    setForm({
      title: "",
      category: "Outdoor",
      description: "",
    });
  
    setSuccessModal(true);
  };

  return (
    <>
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

                        <button
                          onClick={() =>
                            setModal({
                              open: true,
                              ideaId: idea.id,
                            })
                          }
                          className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-medium"
                        >
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

      {/* Details Modal */}
      {modal.open && selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[520px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-4">
              Idea Details
            </h2>

            <div className="space-y-3 mb-6">
              <DetailRow label="Title" value={selectedIdea.title} />
              <DetailRow label="Category" value={selectedIdea.category} />
              <DetailRow label="Submitted On" value={selectedIdea.submittedOn} />
              <DetailRow label="Status" value={selectedIdea.status} />
            </div>

            <div className="rounded-[16px] bg-[#F9F8F6] p-4 mb-4">
              <p className="text-sm font-semibold text-[#2F343B] mb-2">
                Description
              </p>
              <p className="text-sm text-[#7A8088] leading-[170%]">
                {selectedIdea.description}
              </p>
            </div>

            <div className="rounded-[16px] bg-[#F9F8F6] p-4 mb-6">
              <p className="text-sm font-semibold text-[#2F343B] mb-2">
                Review Note
              </p>
              <p className="text-sm text-[#7A8088] leading-[170%]">
                {selectedIdea.note}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

{successModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
      <h2 className="text-xl font-bold text-[#2F343B] mb-3">
        Idea Submitted
      </h2>

      <p className="text-sm text-[#7A8088] mb-6 leading-[170%]">
        Your idea has been submitted successfully and is now waiting for review.
      </p>

      <div className="flex justify-end">
        <button
          onClick={() => setSuccessModal(false)}
          className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
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