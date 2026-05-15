<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Stream a CSV. Adds the UTF-8 BOM so Excel opens accents correctly.
     */
    private function streamCsv(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        return response()->stream(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM so Excel detects encoding correctly
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers, ';');
            foreach ($rows as $row) {
                fputcsv($out, $row, ';');
            }
            fclose($out);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    /**
     * GET /export/registrations.csv
     * All registrations with employee + activity + session context.
     */
    public function registrations(Request $request)
    {
        $q = DB::table('registrations as r')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->join('activity_sessions as s', 's.id', '=', 'r.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->select(
                'r.id',
                'r.reference_number',
                'u.employee_number',
                'u.first_name',
                'u.name',
                'u.email',
                'a.title as activity_title',
                'a.category',
                's.start_date',
                's.end_date',
                'r.status',
                'r.registered_at',
                'r.rejection_reason'
            )
            ->orderBy('r.registered_at', 'desc');

        if ($status = $request->query('status')) {
            $q->where('r.status', strtoupper($status));
        }

        $headers = [
            'ID',
            'Référence',
            'Matricule',
            'Prénom',
            'Nom',
            'Email',
            'Activité',
            'Catégorie',
            'Début',
            'Fin',
            'Statut',
            'Inscrit le',
            'Motif rejet',
        ];

        $rows = $q->get()->map(fn($r) => [
            $r->id,
            $r->reference_number,
            $r->employee_number,
            $r->first_name,
            $r->name,
            $r->email,
            $r->activity_title,
            $r->category,
            $r->start_date,
            $r->end_date,
            $r->status,
            $r->registered_at,
            $r->rejection_reason,
        ])->all();

        return $this->streamCsv(
            'Sonatrach_inscriptions_' . now()->format('Ymd_His') . '.csv',
            $headers,
            $rows
        );
    }

    /**
     * GET /export/draws.csv
     * All executed draws with their summary counts.
     */
    public function draws()
    {
        $rows = DB::table('draws as d')
            ->join('activity_sessions as s', 's.id', '=', 'd.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->leftJoin('users as u', 'u.id', '=', 'd.admin_id')
            ->where('d.executed', 1)
            ->select(
                'd.draw_id',
                'a.title as activity_title',
                'a.category',
                's.id as session_id',
                's.start_date',
                's.end_date',
                'd.draw_date',
                'd.draw_location',
                'd.mode',
                'u.first_name as admin_first',
                'u.name as admin_last',
                'd.executed_at',
                DB::raw('(SELECT COUNT(*) FROM draw_results dr WHERE dr.draw_id = d.draw_id AND dr.is_selected = 1) AS selected_count'),
                DB::raw('(SELECT COUNT(*) FROM draw_results dr WHERE dr.draw_id = d.draw_id AND dr.is_substitute = 1) AS substitute_count'),
                DB::raw('(SELECT COUNT(*) FROM draw_results dr WHERE dr.draw_id = d.draw_id AND dr.is_selected = 0 AND dr.is_substitute = 0) AS waiting_count')
            )
            ->orderByDesc('d.executed_at')
            ->get();

        $headers = [
            'Draw ID',
            'Activité',
            'Catégorie',
            'Session',
            'Début',
            'Fin',
            'Date tirage',
            'Lieu',
            'Mode',
            'Administrateur',
            'Exécuté le',
            'Sélectionnés',
            'Substituts',
            'Liste d\'attente',
        ];

        $data = $rows->map(fn($r) => [
            $r->draw_id,
            $r->activity_title,
            $r->category,
            $r->session_id,
            $r->start_date,
            $r->end_date,
            $r->draw_date,
            $r->draw_location,
            $r->mode,
            trim(($r->admin_first ?? '') . ' ' . ($r->admin_last ?? '')),
            $r->executed_at,
            $r->selected_count,
            $r->substitute_count,
            $r->waiting_count,
        ])->all();

        return $this->streamCsv(
            'Sonatrach_tirages_' . now()->format('Ymd_His') . '.csv',
            $headers,
            $data
        );
    }

    /**
     * GET /export/draws/{id}/results.csv
     * Full results of a single draw (selected, substitutes, waiting).
     */
    public function drawResults($drawId)
    {
        $rows = DB::table('draw_results as dr')
            ->join('registrations as r', 'r.id', '=', 'dr.registration_id')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->leftJoin('session_sites as ss', 'ss.id', '=', 'dr.session_site_id')
            ->leftJoin('sites as site', 'site.id', '=', 'ss.site_id')
            ->where('dr.draw_id', $drawId)
            ->select(
                'dr.id',
                'u.employee_number',
                'u.first_name',
                'u.name',
                'u.email',
                'site.name as site_name',
                'dr.is_selected',
                'dr.is_substitute',
                'dr.substitute_rank',
                'dr.result_rank'
            )
            ->orderBy('dr.result_rank')
            ->get();

        $headers = [
            'ID',
            'Matricule',
            'Prénom',
            'Nom',
            'Email',
            'Site assigné',
            'Issue',
            'Rang substitut',
            'Rang global',
        ];

        $data = $rows->map(function ($r) {
            $issue = $r->is_selected
                ? 'Sélectionné'
                : ($r->is_substitute ? 'Substitut' : 'Liste d\'attente');
            return [
                $r->id,
                $r->employee_number,
                $r->first_name,
                $r->name,
                $r->email,
                $r->site_name ?? '—',
                $issue,
                $r->substitute_rank,
                $r->result_rank,
            ];
        })->all();

        return $this->streamCsv(
            'Sonatrach_tirage_' . $drawId . '_resultats.csv',
            $headers,
            $data
        );
    }

    /**
     * GET /export/audit-log.csv
     */
    public function auditLog()
    {
        $rows = DB::table('audit_logs as al')
            ->leftJoin('users as u', 'u.id', '=', 'al.user_id')
            ->select(
                'al.id',
                'al.action_date',
                'u.first_name',
                'u.name',
                'u.employee_number',
                'al.action',
                'al.target_table',
                'al.target_id',
                'al.target_name',
                'al.ip_address',
                'al.details'
            )
            ->orderByDesc('al.action_date')
            ->limit(2000)
            ->get();

        $headers = [
            'ID',
            'Date',
            'Utilisateur',
            'Matricule',
            'Action',
            'Table',
            'Cible ID',
            'Cible',
            'IP',
            'Détails',
        ];

        $data = $rows->map(fn($r) => [
            $r->id,
            $r->action_date,
            trim(($r->first_name ?? '') . ' ' . ($r->name ?? '')) ?: 'Système',
            $r->employee_number,
            $r->action,
            $r->target_table,
            $r->target_id,
            $r->target_name,
            $r->ip_address,
            is_string($r->details) ? $r->details : json_encode($r->details),
        ])->all();

        return $this->streamCsv(
            'Sonatrach_audit_log_' . now()->format('Ymd_His') . '.csv',
            $headers,
            $data
        );
    }
}
