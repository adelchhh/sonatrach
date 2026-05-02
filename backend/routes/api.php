<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActiviteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SystemRoleController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SessionSiteController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\DrawController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\EmployeeRegistrationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\IdeaController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AnnouncementController;

// ----- AUTH -----
Route::post('/login', [AuthController::class, 'login']);

// ----- ACTIVITIES -----
Route::get('/activities', [ActiviteController::class, 'index']);
Route::get('/activities/{id}', [ActiviteController::class, 'show']);
Route::post('/activities', [ActiviteController::class, 'store']);
Route::put('/activities/{id}', [ActiviteController::class, 'update']);
Route::patch('/activities/{id}/status', [ActiviteController::class, 'updateStatus']);
Route::delete('/activities/{id}', [ActiviteController::class, 'destroy']);

// ----- SITES -----
Route::get('/sites', [SiteController::class, 'index']);
Route::post('/sites', [SiteController::class, 'store']);
Route::put('/sites/{id}', [SiteController::class, 'update']);
Route::delete('/sites/{id}', [SiteController::class, 'destroy']);

// ----- SESSIONS -----
Route::get('/sessions', [SessionController::class, 'index']);
Route::get('/sessions/{id}', [SessionController::class, 'show']);
Route::put('/sessions/{id}', [SessionController::class, 'update']);
Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
Route::get('/activities/{activityId}/sessions', [SessionController::class, 'indexByActivity']);
Route::post('/activities/{activityId}/sessions', [SessionController::class, 'store']);

// ----- REGISTRATIONS -----
Route::get('/registrations', [RegistrationController::class, 'index']);

// ----- EMPLOYEE -----
Route::get('/me/registrations', [EmployeeRegistrationController::class, 'myRegistrations']);
Route::post('/sessions/{sessionId}/register', [EmployeeRegistrationController::class, 'register']);

// ----- EMPLOYEE DATA -----
Route::get('/me/documents', [EmployeeController::class, 'myDocuments']);

// ================= API PREFIX =================
Route::prefix('api')->group(function () {

    // ===== SYSTEM =====
    Route::get('/system/roles/functional-admins', [SystemRoleController::class, 'functionalAdmins']);
    Route::get('/system/roles/communicators', [SystemRoleController::class, 'communicators']);
    Route::get('/system/roles/system-admins', [SystemRoleController::class, 'systemAdmins']);

    // ===== ANNOUNCEMENTS =====
    Route::get('/announcements', [AnnouncementController::class, 'publicIndex']);
    Route::get('/announcements/{id}', [AnnouncementController::class, 'publicShow']);

    Route::get('/communicator/announcements', [AnnouncementController::class, 'communicatorIndex']);
    Route::post('/communicator/announcements', [AnnouncementController::class, 'store']);
    Route::delete('/communicator/announcements/{id}', [AnnouncementController::class, 'destroy']);
    Route::patch('/communicator/announcements/{id}/publish', [AnnouncementController::class, 'publish']);

    // ===== SURVEYS =====
    Route::get('/surveys', [SurveyController::class, 'index']);
    Route::post('/surveys/{id}/respond', [SurveyController::class, 'respond']);

    Route::prefix('communicator/surveys')->group(function () {
        Route::get('/', [SurveyController::class, 'index']);
        Route::post('/', [SurveyController::class, 'store']);
        Route::delete('/{id}', [SurveyController::class, 'destroy']);
        Route::post('/{id}/publish', [SurveyController::class, 'publish']);
        Route::post('/{id}/archive', [SurveyController::class, 'archive']);
    });

    // ===== IDEAS =====
    Route::get('/ideas', [IdeaController::class, 'index']);
    Route::patch('/ideas/{id}/moderate', [IdeaController::class, 'moderate']);

    // ===== NOTIFICATIONS =====
    Route::get('/notifications/sent', [NotificationController::class, 'adminList']);
    Route::post('/notifications', [NotificationController::class, 'send']);
});