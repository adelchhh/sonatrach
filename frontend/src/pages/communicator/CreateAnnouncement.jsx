import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link, useNavigate } from "react-router-dom";
import { createAnnouncement } from "../../services/announcementService";
import { useT } from "../../i18n/LanguageContext";

export default function CreateAnnouncement() {
  const t = useT();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    hasDocument: false,
    document: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitAnnouncement = async (status) => {
    setLoading(true);
    setError("");

    try {
      await createAnnouncement({
        title: form.title,
        content: form.content,
        status,
        document: form.hasDocument ? form.document : null,
      });

      navigate("/dashboard/communicator/announcements");
    } catch (err) {
      setError(err.message || t("communicator.createAnnouncement.createImpossible"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    submitAnnouncement("DRAFT");
  };

  const handlePublish = () => {
    submitAnnouncement("PUBLISHED");
  };

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                    {t("dashboard.sidebar.communicatorTools")}
                  </p>
                  <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                    {t("communicator.createAnnouncement.title")}
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    {t("communicator.createAnnouncement.subtitle")}
                  </p>
                </div>

                <Link
                  to="/dashboard/communicator/announcements"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold hover:bg-[#F8F7F4] transition-colors"
                >
                  {t("communicator.createAnnouncement.back")}
                </Link>
              </div>

              {error && (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
                <div className="space-y-6">
                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createAnnouncement.sectionInfo")}
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1 mb-5">
                      {t("communicator.createAnnouncement.sectionInfoSub")}
                    </p>

                    <div className="space-y-5">
                      <Field label={t("communicator.createAnnouncement.titleField")}>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => handleChange("title", e.target.value)}
                          placeholder={t("communicator.createAnnouncement.titlePlaceholder")}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createAnnouncement.contentField")}
                    </h2>

                    <Field label={t("communicator.createAnnouncement.contentField")}>
                      <textarea
                        value={form.content}
                        onChange={(e) => handleChange("content", e.target.value)}
                        placeholder={t("communicator.createAnnouncement.contentPlaceholder")}
                        rows={10}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none mt-5"
                      />
                    </Field>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createAnnouncement.sectionDoc")}
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1 mb-5">
                      {t("communicator.createAnnouncement.sectionDocSub")}
                    </p>

                    <div className="rounded-[18px] border border-[#E5E2DC] bg-[#FBFAF8] p-4 flex items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-sm font-semibold text-[#2F343B]">
                          {t("communicator.createAnnouncement.attachDoc")}
                        </p>
                        <p className="text-xs text-[#7A8088] mt-1">
                          {t("communicator.createAnnouncement.attachDocHint")}
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
                      <Field label={t("communicator.createAnnouncement.fileLabel")}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={(e) => handleChange("document", e.target.files[0])}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                        {form.document && (
                          <p className="text-xs text-[#7A8088] mt-2">
                            {t("communicator.createAnnouncement.selected", { name: form.document.name })}
                          </p>
                        )}
                      </Field>
                    )}
                  </section>
                </div>

                <div className="space-y-5">
                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createAnnouncement.sectionPreview")}
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      {t("communicator.createAnnouncement.sectionPreviewSub")}
                    </p>

                    <div className="space-y-3">
                      <SummaryRow label={t("communicator.createAnnouncement.summaryTitle")} value={form.title || t("communicator.createAnnouncement.notDefined")} />
                      <SummaryRow
                        label={t("communicator.createAnnouncement.summaryDoc")}
                        value={form.hasDocument ? t("communicator.announcements.attached") : t("communicator.createAnnouncement.none")}
                      />
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createAnnouncement.sectionActions")}
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      {t("communicator.createAnnouncement.sectionActionsSub")}
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={handleSaveDraft}
                        disabled={loading}
                        className="w-full px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold hover:bg-[#F8F7F4] transition-colors disabled:opacity-60"
                      >
                        {loading ? t("communicator.createAnnouncement.savingDraft") : t("communicator.createAnnouncement.saveDraft")}
                      </button>

                      <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="w-full px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                      >
                        {loading ? t("communicator.createAnnouncement.publishing") : t("communicator.createAnnouncement.publishNow")}
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
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
      <span className="text-sm font-bold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}