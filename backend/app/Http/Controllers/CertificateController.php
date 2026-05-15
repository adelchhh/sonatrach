<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CertificateController extends Controller
{
    /**
     * Stream a freshly-generated PDF certificate of participation.
     *
     * GET /participations/{id}/certificate
     *
     * The participation must exist. We resolve user + activity + site via
     * the session_site link (participations.session_site_id → session_sites
     * → activity_sessions → activities; sites.id ← session_sites.site_id).
     */
    public function download($participationId)
    {
        $row = DB::table('participations as p')
            ->join('users as u', 'u.id', '=', 'p.user_id')
            ->join('session_sites as ss', 'ss.id', '=', 'p.session_site_id')
            ->join('activity_sessions as s', 's.id', '=', 'ss.session_id')
            ->join('activities as a', 'a.id', '=', 's.activity_id')
            ->join('sites as site', 'site.id', '=', 'ss.site_id')
            ->where('p.id', $participationId)
            ->select(
                'p.id as participation_id',
                'p.rating',
                'p.date_p',
                'u.first_name as user_first_name',
                'u.name as user_last_name',
                'u.employee_number',
                'a.title as activity_title',
                'a.category as activity_category',
                's.start_date',
                's.end_date',
                'site.name as site_name'
            )
            ->first();

        if (!$row) {
            return response()->json([
                'success' => false,
                'message' => 'Participation introuvable.',
            ], 404);
        }

        $startDate = $row->start_date
            ? \Carbon\Carbon::parse($row->start_date)->locale('fr')->isoFormat('DD MMM YYYY')
            : '—';
        $endDate = $row->end_date
            ? \Carbon\Carbon::parse($row->end_date)->locale('fr')->isoFormat('DD MMM YYYY')
            : '—';

        $payload = [
            'reference' => 'SNTR-' . str_pad((string) $row->participation_id, 6, '0', STR_PAD_LEFT),
            'userFirstName' => $row->user_first_name,
            'userLastName' => strtoupper($row->user_last_name ?? ''),
            'employeeNumber' => $row->employee_number,
            'activityTitle' => $row->activity_title,
            'category' => $row->activity_category,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'siteName' => $row->site_name,
        ];

        $pdf = Pdf::loadView('certificate', $payload)
                  ->setPaper('a4', 'landscape');

        $filename = sprintf(
            'Certificat_Sonatrach_%s_%s.pdf',
            preg_replace('/[^A-Za-z0-9_-]/', '_', $row->user_last_name ?? 'employe'),
            str_pad((string) $row->participation_id, 6, '0', STR_PAD_LEFT)
        );

        return $pdf->stream($filename);
    }

    /**
     * Demo helper — generate a sample certificate without requiring a real
     * participation row. Useful to show the PDG what the output looks like.
     *
     * GET /demo/certificate
     */
    public function demo()
    {
        $payload = [
            'reference' => 'SNTR-DEMO-001',
            'userFirstName' => 'Adel',
            'userLastName' => 'CHOUIA',
            'employeeNumber' => '000999',
            'activityTitle' => 'Voyages organisés — Cappadoce',
            'category' => 'TRAVEL',
            'startDate' => '10 août 2026',
            'endDate' => '20 août 2026',
            'siteName' => 'Siège Hydra',
        ];

        $pdf = Pdf::loadView('certificate', $payload)
                  ->setPaper('a4', 'landscape');

        return $pdf->stream('Certificat_Sonatrach_DEMO.pdf');
    }
}
