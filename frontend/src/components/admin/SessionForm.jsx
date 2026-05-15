import { useState, useEffect } from "react";
import { useT } from "../../i18n/LanguageContext";
import {
  DataPanel,
  Button,
  Alert,
  TextField,
  Select,
} from "../ui/Studio";

const STATUS_VALUES = ["DRAFT", "OPEN", "CLOSED", "DRAW_DONE", "FINISHED", "CANCELLED"];

export default function SessionForm({
  initial,
  showDrawFields = true,
  submitting = false,
  errorMessage = null,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const t = useT();
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    registration_deadline: "",
    draw_date: "",
    draw_location: "",
    confirmation_delay_hours: 48,
    document_upload_deadline: "",
    transport_included: false,
    telefax_url: "",
    substitutes_count: 2,
    status: "DRAFT",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        start_date: initial.start_date || "",
        end_date: initial.end_date || "",
        registration_deadline: initial.registration_deadline || "",
        draw_date: initial.draw_date || "",
        draw_location: initial.draw_location || "",
        confirmation_delay_hours: initial.confirmation_delay_hours ?? 48,
        document_upload_deadline: initial.document_upload_deadline || "",
        transport_included: !!initial.transport_included,
        telefax_url: initial.telefax_url || "",
        substitutes_count: initial.substitutes_count ?? 2,
        status: initial.status || "DRAFT",
      });
    }
  }, [initial]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      draw_date: form.draw_date || null,
      draw_location: form.draw_location || null,
      document_upload_deadline: form.document_upload_deadline || null,
      telefax_url: form.telefax_url || null,
      confirmation_delay_hours: Number(form.confirmation_delay_hours) || 0,
      substitutes_count: Number(form.substitutes_count) || 0,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert tone="danger" title="Erreur">
          {errorMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <DataPanel
            title={t("admin.sessionForm.sessionDates")}
            subtitle={t("admin.sessionForm.sessionDatesHint")}
          >
            <div className="px-6 py-4 bg-[#FFF7E8] border-b border-[#E5E5E5] text-[12px] text-[#7A4F0A] flex items-start gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-[#ED8D31] mt-1.5" />
              <span>
                La date limite d'inscription doit être ≤ à la date de début. La
                date de fin doit être ≥ à la date de début.
              </span>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DateField
                  label={t("admin.sessionForm.startDate")}
                  value={form.start_date}
                  onChange={(v) => update("start_date", v)}
                  required
                />
                <DateField
                  label={t("admin.sessionForm.endDate")}
                  value={form.end_date}
                  onChange={(v) => update("end_date", v)}
                  required
                />
                <DateField
                  label={t("admin.sessionForm.registrationDeadline")}
                  value={form.registration_deadline}
                  onChange={(v) => update("registration_deadline", v)}
                  required
                />
                <DateField
                  label={t("admin.sessionForm.documentUploadDeadline")}
                  value={form.document_upload_deadline}
                  onChange={(v) => update("document_upload_deadline", v)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label={t("admin.sessionForm.confirmationDelay")}
                  type="number"
                  value={form.confirmation_delay_hours}
                  onChange={(v) => update("confirmation_delay_hours", v)}
                />
                <TextField
                  label={t("admin.sessionForm.substitutesCount")}
                  type="number"
                  value={form.substitutes_count}
                  onChange={(v) => update("substitutes_count", v)}
                />
              </div>
            </div>
          </DataPanel>

          {showDrawFields && (
            <DataPanel
              title={t("admin.sessionForm.drawSettings")}
              subtitle={t("admin.sessionForm.drawSettingsHint")}
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <DateField
                  label={t("admin.sessionForm.drawDate")}
                  value={form.draw_date}
                  onChange={(v) => update("draw_date", v)}
                />
                <TextField
                  label={t("admin.sessionForm.drawLocation")}
                  value={form.draw_location}
                  onChange={(v) => update("draw_location", v)}
                  placeholder={t("admin.sessionForm.drawLocationPlaceholder")}
                />
              </div>
            </DataPanel>
          )}

          <DataPanel
            title={t("admin.sessionForm.logistics")}
            subtitle={t("admin.sessionForm.logisticsHint")}
          >
            <div className="p-6 space-y-5">
              <ToggleRow
                title={t("admin.sessionForm.transportCovered")}
                description={t("admin.sessionForm.transportHint")}
                checked={form.transport_included}
                onToggle={() =>
                  update("transport_included", !form.transport_included)
                }
              />
              <TextField
                label={t("admin.sessionForm.telefax")}
                value={form.telefax_url}
                onChange={(v) => update("telefax_url", v)}
                placeholder={t("admin.sessionForm.telefaxPlaceholder")}
              />
            </div>
          </DataPanel>

          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" size="md" onClick={onCancel}>
                {t("common.cancel")}
              </Button>
            )}
            <Button type="submit" variant="primary" size="md" disabled={submitting}>
              {submitting ? t("common.saving") : (submitLabel || t("admin.createSession.save"))}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <DataPanel
            title={t("admin.sessionForm.sessionStatus")}
            subtitle={t("admin.sessionForm.sessionStatusHint")}
          >
            <div className="p-6">
              <Select
                label={t("common.status")}
                value={form.status}
                onChange={(v) => update("status", v)}
                options={STATUS_VALUES.map((v) => ({
                  value: v,
                  label: t(`statuses.${v}`),
                }))}
              />
            </div>
          </DataPanel>

          <DataPanel
            title={t("admin.sessionForm.previewSummary")}
            subtitle={t("admin.sessionForm.previewHint")}
          >
            <div className="p-6 space-y-2">
              <SummaryRow label={t("admin.sessionForm.summaryStart")} value={form.start_date || t("common.notSet")} />
              <SummaryRow label={t("admin.sessionForm.summaryEnd")} value={form.end_date || t("common.notSet")} />
              <SummaryRow label={t("admin.sessionForm.summaryRegDeadline")} value={form.registration_deadline || t("common.notSet")} />
              <SummaryRow label={t("admin.sessionForm.summaryDocsDeadline")} value={form.document_upload_deadline || t("common.notSet")} />
              <SummaryRow label={t("admin.sessionForm.summaryDrawDate")} value={form.draw_date || t("common.notSet")} />
              <SummaryRow
                label={t("admin.sessionForm.summaryTransport")}
                value={form.transport_included ? t("admin.sessionForm.transportCoveredYes") : t("admin.sessionForm.transportCoveredNo")}
              />
              <SummaryRow label={t("admin.sessionForm.summarySubstitutes")} value={String(form.substitutes_count)} />
              <SummaryRow label={t("common.status")} value={t(`statuses.${form.status}`)} />
            </div>
          </DataPanel>
        </div>
      </div>
    </form>
  );
}

function DateField({ label, value, onChange, required }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
        {label}
        {required && <span className="text-[#ED8D31] ml-1">*</span>}
      </span>
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] text-[14px] text-[#0A0A0A] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
      />
    </label>
  );
}

function ToggleRow({ title, description, checked, onToggle }) {
  return (
    <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-[14px] font-bold text-[#0A0A0A]">{title}</p>
        <p className="text-[11px] text-[#737373] mt-1 leading-[1.55]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-11 h-6 transition-colors ${checked ? "bg-[#0A0A0A]" : "bg-[#E5E5E5]"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-[#F5F5F5] last:border-b-0">
      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#737373]">
        {label}
      </span>
      <span className="text-[12px] font-bold text-[#0A0A0A] text-right tabular-nums">
        {value}
      </span>
    </div>
  );
}
