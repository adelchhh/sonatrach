import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "../../services/announcementService";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  DataPanel,
  Button,
  Alert,
  TextField,
  TextArea,
} from "../../components/ui/Studio";

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

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

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
      setError(err.message || t("sg.saveImpossible"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title={t("sg.newAnnouncement")}
        subtitle={t("sg.subAnnouncements")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          {
            label: t("sg.announcements"),
            to: "/dashboard/communicator/announcements",
          },
          { label: t("sg.newRecord") },
        ]}
        actions={
          <Button
            to="/dashboard/communicator/announcements"
            variant="outline"
            size="md"
          >
            ← {t("sg.back")}
          </Button>
        }
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <DataPanel
              title={t("sg.sectionInfo")}
              subtitle={t("sg.subAnnouncements")}
            >
              <div className="p-6 space-y-5">
                <TextField
                  label={t("sg.colTitle")}
                  value={form.title}
                  onChange={(v) => update("title", v)}
                  placeholder={t("sg.phTitle")}
                  required
                />
                <TextArea
                  label={t("sg.labelContent")}
                  value={form.content}
                  onChange={(v) => update("content", v)}
                  placeholder={t("sg.phContent")}
                  rows={10}
                  required
                />
              </div>
            </DataPanel>

            <DataPanel
              title={t("sg.labelDocument")}
              subtitle="PDF, Word, JPG, PNG"
            >
              <div className="p-6 space-y-5">
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-[#0A0A0A]">
                      {t("sg.attached")}
                    </p>
                    <p className="text-[11px] text-[#737373] mt-1 leading-[1.55]">
                      PDF, Word, JPG, PNG
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => update("hasDocument", !form.hasDocument)}
                    className={`relative w-11 h-6 transition-colors ${
                      form.hasDocument ? "bg-[#0A0A0A]" : "bg-[#E5E5E5]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white transition-all ${
                        form.hasDocument ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {form.hasDocument && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
                      {t("sg.labelDocument")}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => update("document", e.target.files[0])}
                      className="w-full text-[12px] text-[#0A0A0A] file:mr-3 file:bg-[#0A0A0A] file:text-white file:px-4 file:py-2 file:border-0 file:text-[11px] file:uppercase file:tracking-wider file:font-bold file:cursor-pointer hover:file:bg-black"
                    />
                    {form.document && (
                      <p className="text-[11px] text-[#737373] mt-2">
                        {form.document.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DataPanel>
          </div>

          <div className="space-y-6">
            <DataPanel title={t("sg.preview")} subtitle={t("sg.sectionPreviewSub")}>
              <div className="p-6 space-y-2">
                <SummaryRow label={t("sg.colTitle")} value={form.title || t("sg.notDefined")} />
                <SummaryRow
                  label={t("sg.labelDocument")}
                  value={form.hasDocument ? t("sg.attached") : t("sg.noneNeutral")}
                />
                <SummaryRow
                  label="N"
                  value={`${form.content.length}`}
                />
              </div>
            </DataPanel>

            <DataPanel title={t("sg.colActions")} subtitle={t("sg.sectionPreviewSub")}>
              <div className="p-6 space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => submitAnnouncement("DRAFT")}
                  disabled={loading}
                >
                  {loading ? t("sg.processing") : t("sg.saveDraft")}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => submitAnnouncement("PUBLISHED")}
                  disabled={loading}
                >
                  {loading ? t("sg.processing") : t("sg.publishNow")}
                </Button>
              </div>
            </DataPanel>
          </div>
        </div>
      </PageBody>
    </PageShell>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-[#F5F5F5] last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#737373]">
        {label}
      </span>
      <span className="text-[13px] font-bold text-[#0A0A0A] text-right truncate">
        {value}
      </span>
    </div>
  );
}
