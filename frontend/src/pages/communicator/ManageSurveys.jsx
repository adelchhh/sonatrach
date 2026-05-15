import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  Toolbar,
  SearchInput,
  SelectInput,
  DataPanel,
  StatusPill,
  Modal,
  Button,
  Alert,
} from "../../components/ui/Studio";

const API_URL = `${API_BASE_URL}/api`;

const STATUS_TONE = {
  DRAFT: "warn",
  PUBLISHED: "success",
  ARCHIVED: "neutral",
};

export default function ManageSurveys() {
  const t = useT();
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, type: null, id: null });

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/communicator/surveys`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Impossible de charger les sondages.");
        return;
      }
      setSurveys(data.data || []);
    } catch (err) {
      setError("Erreur serveur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const selected = surveys.find((s) => s.id === modal.id) || null;

  const filtered = surveys.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      String(s.title || "").toLowerCase().includes(q) ||
      String(s.summary || "").toLowerCase().includes(q) ||
      String(s.target_audience || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = surveys.length;
  const draftCount = surveys.filter((s) => s.status === "DRAFT").length;
  const publishedCount = surveys.filter((s) => s.status === "PUBLISHED").length;
  const archivedCount = surveys.filter((s) => s.status === "ARCHIVED").length;

  const participationRate = (s) => {
    const invited = Number(s.total_invited || 0);
    const responses = Number(s.total_responses || 0);
    if (!invited) return "0%";
    return `${Math.round((responses / invited) * 100)}%`;
  };

  const closeModal = () => setModal({ open: false, type: null, id: null });

  const performAction = async (action, id) => {
    try {
      const res = await fetch(`${API_URL}/communicator/surveys/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || `Action ${action} impossible.`);
        return;
      }
      closeModal();
      await loadSurveys();
    } catch (err) {
      setError(`Erreur serveur (${action}).`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/communicator/surveys/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Suppression impossible.");
        return;
      }
      closeModal();
      await loadSurveys();
    } catch (err) {
      setError("Erreur serveur (suppression).");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title="Sondages"
        subtitle="Publiez les avis de sondage, suivez la participation et archivez les anciennes consultations."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Sondages" },
        ]}
        actions={
          <Button
            to="/dashboard/communicator/surveys/create"
            variant="primary"
            size="md"
            icon={<span className="text-[14px] leading-none">＋</span>}
          >
            Nouveau sondage
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
          <StatCell label="Total" value={totalCount} sub="Tous sondages" />
          <StatCell
            label="Brouillons"
            value={draftCount}
            sub="Non publiés"
            accent={draftCount > 0}
          />
          <StatCell label="Publiés" value={publishedCount} sub="Visibles" />
          <StatCell label="Archivés" value={archivedCount} sub="Hors-circuit" />
        </StatBar>

        <Toolbar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par titre, audience…"
          />
          <SelectInput
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Tous statuts" },
              { value: "DRAFT", label: "Brouillon" },
              { value: "PUBLISHED", label: "Publié" },
              { value: "ARCHIVED", label: "Archivé" },
            ]}
          />
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Réinitialiser
          </Button>
        </Toolbar>

        <DataPanel
          title="Sondages publiés"
          subtitle="Statut, audience et taux de participation"
          badge={`${filtered.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    "Titre",
                    "Statut",
                    "Audience",
                    "Publication",
                    "Participation",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      Chargement…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      Aucun sondage à afficher.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5 max-w-[360px]">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-1 line-clamp-2">
                          {item.question}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          tone={STATUS_TONE[item.status] || "neutral"}
                          label={item.status}
                        />
                      </td>
                      <td className="px-6 py-5 text-[12px] text-[#525252]">
                        {item.target_audience || "—"}
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {item.start_date || "—"}
                      </td>
                      <td className="px-6 py-5 text-[14px] font-bold tabular-nums text-[#ED8D31]">
                        {participationRate(item)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setModal({ open: true, type: "details", id: item.id })
                            }
                          >
                            Détails
                          </Button>
                          {item.status === "DRAFT" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                setModal({ open: true, type: "publish", id: item.id })
                              }
                            >
                              Publier
                            </Button>
                          )}
                          {item.status !== "ARCHIVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setModal({ open: true, type: "archive", id: item.id })
                              }
                            >
                              Archiver
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setModal({ open: true, type: "delete", id: item.id })
                            }
                          >
                            Supprimer
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
        title={selected?.title || "Détails"}
        width="lg"
        footer={
          <Button variant="outline" size="md" onClick={closeModal}>
            Fermer
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <DetailItem label="Statut" value={selected.status} />
              <DetailItem label="Audience" value={selected.target_audience || "—"} />
              <DetailItem label="Publication" value={selected.publish_date || "—"} />
              <DetailItem label="Échéance" value={selected.end_date || "—"} />
              <DetailItem label="CTA" value={selected.cta_label || "—"} />
              <DetailItem label="Participation" value={participationRate(selected)} />
            </div>
            <div className="border-t border-[#E5E5E5] pt-4">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-2">
                Question
              </p>
              <p className="text-[13px] text-[#0A0A0A] leading-[1.7]">
                {selected.question || "—"}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modal.open && modal.type === "publish" && !!selected}
        onClose={closeModal}
        title="Publier le sondage"
        description={
          selected ? `Publier « ${selected.title} » pour ${selected.target_audience || "l'audience sélectionnée"} ?` : ""
        }
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => selected && performAction("publish", selected.id)}
            >
              Publier
            </Button>
          </>
        }
      />

      <Modal
        open={modal.open && modal.type === "archive" && !!selected}
        onClose={closeModal}
        title="Archiver le sondage"
        description={selected ? `Archiver « ${selected.title} » ?` : ""}
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              variant="dark"
              size="md"
              onClick={() => selected && performAction("archive", selected.id)}
            >
              Archiver
            </Button>
          </>
        }
      />

      <Modal
        open={modal.open && modal.type === "delete" && !!selected}
        onClose={closeModal}
        title="Supprimer le sondage"
        description={selected ? `Supprimer définitivement « ${selected.title} » ?` : ""}
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => selected && handleDelete(selected.id)}
            >
              Supprimer
            </Button>
          </>
        }
      />
    </PageShell>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-1">
        {label}
      </p>
      <p className="text-[13px] font-bold text-[#0A0A0A]">{value}</p>
    </div>
  );
}
