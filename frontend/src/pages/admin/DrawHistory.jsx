import { useEffect, useState } from "react";
import { apiGet } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  DataPanel,
  StatusPill,
  Modal,
  Button,
  Alert,
} from "../../components/ui/Studio";

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DrawHistory() {
  const t = useT();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [modal, setModal] = useState({ open: false, drawId: null });
  const [details, setDetails] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/draws/history")
      .then((res) => setDraws(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger l'historique.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openDetails = async (drawId) => {
    setModal({ open: true, drawId });
    setDetails(null);
    try {
      const res = await apiGet(`/draws/${drawId}`);
      setDetails(res.data);
    } catch (err) {
      setDetails({ error: err.message || "Détails indisponibles." });
    }
  };

  const closeModal = () => {
    setModal({ open: false, drawId: null });
    setDetails(null);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title="Historique des tirages"
        subtitle="Journal d'audit de tous les tirages exécutés. Cliquez sur une ligne pour voir les listes complètes (sélectionnés / substituts / liste d'attente)."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Historique des tirages" },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <DataPanel
          title="Tirages exécutés"
          subtitle="Audit complet, du plus récent au plus ancien"
          badge={`${draws.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    "Exécuté le",
                    "Activité",
                    "Session",
                    "Mode",
                    "Administrateur",
                    "Résultats",
                    "Action",
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
                    <td colSpan={7} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      Chargement…
                    </td>
                  </tr>
                ) : draws.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      Aucun tirage exécuté pour le moment.
                    </td>
                  </tr>
                ) : (
                  draws.map((d) => (
                    <tr
                      key={d.draw_id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#0A0A0A]">
                        {formatDateTime(d.executed_at)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {d.activity_title}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-[#737373] mt-1">
                          {d.activity_category}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        #{d.session_id}
                        <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                          {d.draw_location || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill tone="info" label={d.mode} />
                      </td>
                      <td className="px-6 py-5 text-[13px] text-[#0A0A0A]">
                        {d.admin_first_name} {d.admin_last_name}
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums">
                        <span className="text-[#0A0A0A] font-bold">
                          {d.selected_count}
                        </span>
                        <span className="text-[#A3A3A3]"> sélect.</span>
                        <span className="mx-1.5 text-[#E5E5E5]">·</span>
                        <span className="text-[#ED8D31] font-bold">
                          {d.substitute_count}
                        </span>
                        <span className="text-[#A3A3A3]"> subst.</span>
                        <span className="mx-1.5 text-[#E5E5E5]">·</span>
                        <span className="text-[#737373] font-bold">
                          {d.waiting_count}
                        </span>
                        <span className="text-[#A3A3A3]"> attente</span>
                      </td>
                      <td className="px-6 py-5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(d.draw_id)}
                        >
                          Détails
                        </Button>
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
        open={modal.open}
        onClose={closeModal}
        title={`Tirage #${modal.drawId} — résultats complets`}
        width="lg"
        footer={
          <Button variant="outline" size="md" onClick={closeModal}>
            Fermer
          </Button>
        }
      >
        {!details && (
          <p className="text-[13px] text-[#737373]">Chargement…</p>
        )}
        {details?.error && (
          <Alert tone="danger" title={t("sg.error")}>
            {details.error}
          </Alert>
        )}
        {details?.results && (
          <div className="space-y-6">
            <ResultsBlock
              title="Sélectionnés"
              tone="dark"
              items={details.results.filter(
                (r) => r.is_selected === 1 || r.is_selected === true
              )}
              showSite
            />
            <ResultsBlock
              title="Substituts"
              tone="accent"
              items={details.results.filter(
                (r) =>
                  (r.is_substitute === 1 || r.is_substitute === true) &&
                  !(r.is_selected === 1 || r.is_selected === true)
              )}
              showRank
            />
            <ResultsBlock
              title="Liste d'attente"
              tone="neutral"
              items={details.results.filter(
                (r) =>
                  (r.is_selected === 0 || r.is_selected === false) &&
                  (r.is_substitute === 0 || r.is_substitute === false)
              )}
            />
          </div>
        )}
      </Modal>
    </PageShell>
  );
}

function ResultsBlock({ title, items, tone, showSite, showRank }) {
  const accent = {
    dark: "bg-[#0A0A0A] text-white",
    accent: "bg-[#ED8D31] text-black",
    neutral: "bg-[#F5F5F5] text-[#0A0A0A]",
  }[tone];

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${accent}`}>
          {title}
        </span>
        <span className="text-[12px] tabular-nums text-[#737373]">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-[12px] text-[#A3A3A3] italic">Aucun.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((r) => (
            <li
              key={r.id}
              className="text-[13px] text-[#0A0A0A] px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] flex justify-between items-baseline gap-3"
            >
              <span className="truncate">
                <span className="font-semibold">
                  {r.user_first_name} {r.user_last_name}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-[#737373] ml-2">
                  {r.employee_number}
                </span>
              </span>
              {showSite && r.site_name && (
                <span className="text-[11px] text-[#737373] uppercase tracking-wider">
                  {r.site_name}
                </span>
              )}
              {showRank && r.substitute_rank && (
                <span className="text-[11px] text-[#ED8D31] uppercase tracking-wider font-bold tabular-nums">
                  Rang #{r.substitute_rank}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
