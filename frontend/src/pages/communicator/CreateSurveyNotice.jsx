import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api";
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
  Select,
} from "../../components/ui/Studio";

const API_URL = `${API_BASE_URL}/api`;

export default function CreateSurveyNotice() {
  const t = useT();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    deadline: "",
    summary: "",
    status: "DRAFT",
    question: {
      text: "",
      type: "single_choice",
      options: ["", ""],
    },
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const updateQuestion = (k, v) =>
    setForm((p) => ({ ...p, question: { ...p.question, [k]: v } }));

  const handleOption = (i, v) => {
    setForm((p) => {
      const opts = [...p.question.options];
      opts[i] = v;
      return { ...p, question: { ...p.question, options: opts } };
    });
  };

  const addOption = () =>
    setForm((p) => ({
      ...p,
      question: { ...p.question, options: [...p.question.options, ""] },
    }));

  const removeOption = (i) =>
    setForm((p) => ({
      ...p,
      question: {
        ...p.question,
        options: p.question.options.filter((_, idx) => idx !== i),
      },
    }));

  const submitSurvey = async (status) => {
    try {
      setLoading(true);
      setError("");
      if (!form.title.trim()) {
        setError(t("sg.titleRequired"));
        return;
      }
      if (!form.question.text.trim()) {
        setError(t("sg.questionRequired"));
        return;
      }
      if (
        form.question.type === "single_choice" &&
        form.question.options.filter((o) => o.trim()).length < 2
      ) {
        setError(t("sg.minTwoOptions"));
        return;
      }
      const payload = {
        title: form.title,
        deadline: form.deadline,
        summary: form.summary,
        status,
        question: {
          text: form.question.text,
          type: form.question.type,
          options:
            form.question.type === "single_choice"
              ? form.question.options.filter((o) => o.trim())
              : [],
        },
      };
      const res = await fetch(`${API_URL}/communicator/surveys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user?.id,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t("sg.saveImpossible"));
        return;
      }
      navigate("/dashboard/communicator/surveys");
    } catch (err) {
      setError(t("sg.serverErrorSaving"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title={t("sg.newSurvey")}
        subtitle={t("sg.subSurveys")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.surveys"), to: "/dashboard/communicator/surveys" },
          { label: t("sg.newRecord") },
        ]}
        actions={
          <>
            <Button
              to="/dashboard/communicator/surveys"
              variant="outline"
              size="md"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => submitSurvey("DRAFT")}
              disabled={loading}
            >
              {t("sg.statusDraftLabel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => submitSurvey("PUBLISHED")}
              disabled={loading}
            >
              {t("sg.publish")}
            </Button>
          </>
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
            <DataPanel title={t("sg.sectionInfo")} subtitle={t("sg.sectionInfoSurveySub")}>
              <div className="p-6 space-y-5">
                <TextField
                  label={t("sg.colTitle")}
                  value={form.title}
                  onChange={(v) => update("title", v)}
                  placeholder={t("sg.phTitle")}
                  required
                />
                <TextField
                  label={t("sg.labelDeadline")}
                  type="date"
                  value={form.deadline}
                  onChange={(v) => update("deadline", v)}
                />
                <TextArea
                  label={t("sg.summaryShort")}
                  value={form.summary}
                  onChange={(v) => update("summary", v)}
                  placeholder={t("sg.phSummary")}
                  rows={3}
                />
              </div>
            </DataPanel>

            <DataPanel title={t("sg.sectionSurveyQuestion")}>
              <div className="p-6 space-y-5">
                <Select
                  label={t("sg.labelType")}
                  value={form.question.type}
                  onChange={(v) => updateQuestion("type", v)}
                  options={[
                    { value: "single_choice", label: t("sg.choiceQuestion") },
                    { value: "text", label: t("sg.textQuestion") },
                  ]}
                />
                <TextArea
                  label={t("sg.labelQuestion")}
                  value={form.question.text}
                  onChange={(v) => updateQuestion("text", v)}
                  placeholder={t("sg.phQuestion")}
                  rows={3}
                  required
                />

                {form.question.type === "single_choice" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]">
                        {t("sg.labelOptions")}
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors"
                      >
                        + {t("sg.addOption")}
                      </button>
                    </div>
                    {form.question.options.map((option, i) => (
                      <div key={i} className="flex gap-3">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOption(i, e.target.value)}
                          placeholder={`${t("sg.optionLabel")} ${i + 1}`}
                          className="flex-1 px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] text-[14px] text-[#0A0A0A] placeholder:text-[#A3A3A3] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                        />
                        {form.question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="danger"
                            size="md"
                            onClick={() => removeOption(i)}
                          >
                            {t("sg.removeOption")}
                          </Button>
                        )}
                      </div>
                    ))}
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
                  label={t("sg.labelDeadline")}
                  value={form.deadline || t("sg.notDefined")}
                />
                <SummaryRow
                  label={t("sg.labelType")}
                  value={
                    form.question.type === "single_choice"
                      ? t("sg.choice")
                      : t("sg.textType")
                  }
                />
                <SummaryRow
                  label={t("sg.labelOptions")}
                  value={
                    form.question.type === "single_choice"
                      ? form.question.options.filter((o) => o.trim()).length
                      : "—"
                  }
                />
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
