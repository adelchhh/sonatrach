import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiPostForm } from "../../api";
import { useT } from "../../i18n/LanguageContext";

export default function CreateActivity() {
  const t = useT();
  const navigate = useNavigate();

  const CATEGORY_OPTIONS = [
    { value: "SPORT", label: t("categories.SPORT") },
    { value: "FAMILY", label: t("categories.FAMILY") || "Family" },
    { value: "STAY", label: t("categories.STAY") || "Stay" },
    { value: "NATURE", label: t("categories.NATURE") || "Nature" },
    { value: "SPIRITUAL", label: t("categories.SPIRITUAL") || "Spiritual" },
    { value: "TRAVEL", label: t("categories.TRAVEL") || "Travel" },
    { value: "LEISURE", label: t("categories.LEISURE") },
  ];

  const DEMAND_OPTIONS = [
    { value: "HIGH", label: t("statuses.HIGH") || "High" },
    { value: "MEDIUM", label: t("statuses.MEDIUM") || "Medium" },
    { value: "LOW", label: t("statuses.LOW") || "Low" },
  ];

  const STATUS_OPTIONS = [
    { value: "DRAFT", label: t("statuses.DRAFT") },
    { value: "PUBLISHED", label: t("statuses.PUBLISHED") },
    { value: "ARCHIVED", label: t("statuses.ARCHIVED") },
    { value: "CANCELLED", label: t("statuses.CANCELLED") },
  ];

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "LEISURE",
    minimumSeniority: "1",
    drawEnabled: true,
    demandLevel: "MEDIUM",
    status: "DRAFT",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError(null);

    if (!form.title.trim()) {
      setError(t("common.genericError"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        minimum_seniority: Number(form.minimumSeniority || 1),
        draw_enabled: form.drawEnabled,
        demand_level: form.demandLevel,
        status: form.status,
      };
      if (imageFile) {
        payload.image = imageFile;
      }
      const res = await apiPostForm("/activities", payload);
      const newId = res?.data?.id;
      if (newId) {
        navigate(`/dashboard/admin/activities/${newId}/sessions`);
      } else {
        navigate("/dashboard/admin/activities");
      }
    } catch (err) {
      setError(err.message || t("common.serverError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  {t("admin.createActivity.title")}
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  {t("admin.createActivity.subtitle")}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/dashboard/admin/activities"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  {t("common.cancel")}
                </Link>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                >
                  {saving ? t("common.saving") : t("admin.createActivity.save")}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      {t("admin.createActivity.basicInfo")}
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      {t("admin.createActivity.basicInfoHint")}
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label={t("admin.createActivity.activityTitle")}>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder={t("admin.createActivity.activityTitlePlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label={t("admin.createActivity.description")}>
                      <textarea
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={5}
                        placeholder={t("admin.createActivity.descriptionPlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>

                    <Field label={t("admin.createActivity.coverImage")}>
                      <select
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        {t("admin.createActivity.coverImage")}
                      </label>

                      <label className="rounded-[18px] border border-dashed border-[#D9D5CE] bg-[#FBFAF8] h-[170px] flex flex-col items-center justify-center text-center px-6 cursor-pointer overflow-hidden relative">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-[#F1F0EC] flex items-center justify-center mb-4 text-[#7A8088]">
                              ⬆
                            </div>
                            <p className="text-sm text-[#2F343B] font-medium">
                              {t("admin.createActivity.uploadHint")}
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1">
                              {t("admin.createActivity.uploadFormats")}
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      {t("admin.createActivity.rules")}
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      {t("admin.createActivity.rulesHint")}
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label={t("admin.createActivity.minimumSeniority")}>
                        <select
                          value={form.minimumSeniority}
                          onChange={(e) => handleChange("minimumSeniority", e.target.value)}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        >
                          <option value="1">{t("admin.createActivity.oneYear")}</option>
                          <option value="3">{t("admin.createActivity.threeYears")}</option>
                          <option value="5">{t("admin.createActivity.fiveYears")}</option>
                          <option value="10">{t("admin.createActivity.tenYears")}</option>
                        </select>
                      </Field>

                      <Field label={t("admin.createActivity.requiresDraw")}>
                        <select
                          value={form.drawEnabled ? "Yes" : "No"}
                          onChange={(e) => handleChange("drawEnabled", e.target.value === "Yes")}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                        >
                          <option value="Yes">{t("common.yes")}</option>
                          <option value="No">{t("common.no")}</option>
                        </select>
                      </Field>
                    </div>

                    <Field label={t("activityDetail.demandLevel")}>
                      <select
                        value={form.demandLevel}
                        onChange={(e) => handleChange("demandLevel", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        {DEMAND_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>

                <div className="flex justify-end gap-3">
                  <Link
                    to="/dashboard/admin/activities"
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                  >
                    {t("common.cancel")}
                  </Link>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                  >
                    {saving ? t("common.saving") : t("admin.createActivity.save")}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      {t("admin.createActivity.publishingStatus")}
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      {t("admin.createActivity.publishingHint")}
                    </p>
                  </div>

                  <div className="p-5">
                    <Field label={t("common.status")}>
                      <select
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      {t("admin.createActivity.previewSummary")}
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      {t("admin.createActivity.previewHint")}
                    </p>
                  </div>

                  <div className="p-5 space-y-3">
                    <SummaryRow label={t("admin.createActivity.activityTitle")} value={form.title || t("common.notSet")} />
                    <SummaryRow label={t("common.all")} value={t(`categories.${form.category}`) || form.category} />
                    <SummaryRow
                      label={t("admin.createActivity.minimumSeniority")}
                      value={`${form.minimumSeniority || 1}`}
                    />
                    <SummaryRow
                      label={t("admin.createActivity.requiresDraw")}
                      value={form.drawEnabled ? t("common.yes") : t("common.no")}
                    />
                    <SummaryRow label={t("activityDetail.demandLevel")} value={form.demandLevel} />
                    <SummaryRow label={t("common.status")} value={t(`statuses.${form.status}`) || form.status} />
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
