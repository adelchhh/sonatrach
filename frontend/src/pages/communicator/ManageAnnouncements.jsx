import { useEffect, useState } from "react";
import {
  getCommunicatorAnnouncements,
  publishAnnouncement,
  deleteAnnouncement,
} from "../../services/announcementService";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  StatusPill,
  Modal,
  Button,
  Alert,
} from "../../components/ui/Studio";

const STATUS_TONE = {
  DRAFT: "warn",
  PUBLISHED: "success",
  ARCHIVED: "neutral",
};

function formatDate(item) {
  return item.publish_date || item.created_at?.slice(0, 10) || "—";
}

function shortText(text, max = 110) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ManageAnnouncements() {
  const t = useT();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, type: null, id: null });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const data = await getCommunicatorAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || t("sg.loadingFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(id) {
    try {
      const updated = await publishAnnouncement(id);
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      setError(err.message || t("sg.publishImpossible"));
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
      closeModal();
    } catch (err) {
      setError(err.message || t("sg.deleteImpossible"));
    }
  }

  const closeModal = () =>
    setModal({ open: false, type: null, id: null });

  const selected =
    announcements.find((a) => a.id === modal.id) || null;

  const totalCount = announcements.length;
  const draftCount = announcements.filter((a) => a.status === "DRAFT").length;
  const publishedCount = announcements.filter(
    (a) => a.status === "PUBLISHED"
  ).length;
  const archivedCount = announcements.filter(
    (a) => a.status === "ARCHIVED"
  ).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title={t("sg.announcements")}
        subtitle={t("sg.subAnnouncements")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.announcements") },
        ]}
        actions={
          <Button
            to="/dashboard/communicator/announcements/create"
            variant="primary"
            size="md"
            icon={<span className="text-[14px] leading-none">＋</span>}
          >
            {t("sg.newAnnouncement")}
          </Button>
        }
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell label={t("sg.total")} value={totalCount} sub={t("sg.subAllAnnouncements")} />
          <StatCell
            label={t("sg.drafts")}
            value={draftCount}
            sub={t("sg.subNotPublished")}
            accent={draftCount > 0}
          />
          <StatCell
            label={t("sg.published")}
            value={publishedCount}
            sub={t("sg.subVisibleToEmployees")}
          />
          <StatCell label={t("sg.archived")} value={archivedCount} sub={t("sg.subOffCircuit")} />
        </StatBar>

        <DataPanel
          title={t("sg.panelAnnouncementList")}
          subtitle={t("sg.panelAnnouncementListSub")}
          badge={`${announcements.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[t("sg.colTitle"), t("sg.colDate"), t("sg.colDocument"), t("sg.colStatus"), t("sg.colActions")].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.loading")}
                    </td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.emptyAnnouncementsAll")}
                    </td>
                  </tr>
                ) : (
                  announcements.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5 max-w-[420px]">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {item.title}
                        </p>
                        <p className="text-[12px] text-[#737373] mt-1 line-clamp-2">
                          {shortText(item.content)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {formatDate(item)}
                      </td>
                      <td className="px-6 py-5 text-[12px] text-[#525252]">
                        {item.document_path ? t("sg.attached") : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          tone={STATUS_TONE[item.status] || "neutral"}
                          label={item.status}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "details",
                                id: item.id,
                              })
                            }
                          >
                            {t("sg.details")}
                          </Button>
                          {item.status === "DRAFT" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handlePublish(item.id)}
                            >
                              {t("sg.publish")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "delete",
                                id: item.id,
                              })
                            }
                          >
                            {t("sg.delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </PageBody>

      <Modal
        open={modal.open && modal.type === "details" && !!selected}
        onClose={closeModal}
        title={selected?.title || t("sg.details")}
        width="lg"
        footer={
          <Button variant="outline" size="md" onClick={closeModal}>
            {t("common.close")}
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-1">
                  {t("sg.colDate")}
                </p>
                <p className="text-[13px] font-bold text-[#0A0A0A] tabular-nums">
                  {formatDate(selected)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-1">
                  {t("sg.colStatus")}
                </p>
                <StatusPill
                  tone={STATUS_TONE[selected.status] || "neutral"}
                  label={selected.status}
                />
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-1">
                  {t("sg.labelDocument")}
                </p>
                <p className="text-[13px] text-[#0A0A0A]">
                  {selected.document_name || t("sg.noneNeutral")}
                </p>
              </div>
            </div>
            <div className="border-t border-[#E5E5E5] pt-4">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-2">
                {t("sg.labelContent")}
              </p>
              <p className="text-[13px] text-[#0A0A0A] leading-[1.7] whitespace-pre-line">
                {selected.content}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modal.open && modal.type === "delete" && !!selected}
        onClose={closeModal}
        title={t("sg.deleteAnnouncementTitle")}
        description={
          selected ? `« ${selected.title} »` : ""
        }
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => selected && handleDelete(selected.id)}
            >
              {t("sg.delete")}
            </Button>
          </>
        }
      />
    </PageShell>
  );
}
