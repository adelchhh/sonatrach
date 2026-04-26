import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import ActivityDetail from "./pages/ActivityDetail";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AnnouncementDetails from "./pages/AnnouncementDetails";

// Employee pages
import Dashboard from "./pages/Dashboard";
import MyRequests from "./pages/employee/MyRequests";
import DrawResults from "./pages/employee/DrawResults";
import Documents from "./pages/employee/Documents";
import Surveys from "./pages/employee/Surveys";
import ParticipationHistory from "./pages/employee/ParticipationHistory";
import IdeaBox from "./pages/employee/IdeaBox";
import NotificationsPage from "./pages/employee/NotificationsPage";
import ActivitiesCatalog from "./pages/employee/ActivitiesCatalog";

// Admin (functional)
import ManageActivities from "./pages/admin/ManageActivities";
import CreateActivity from "./pages/admin/CreateActivity";
import ModifyActivity from "./pages/admin/ModifyActivity";
import ManageSessions from "./pages/admin/ManageSessions";
import CreateSession from "./pages/admin/CreateSession";
import SessionDetails from "./pages/admin/SessionDetails";
import EditSession from "./pages/admin/EditSession";
import SitesAndQuotas from "./pages/admin/SitesAndQuotas";
import ManageRegistrations from "./pages/admin/ManageRegistrations";
import ManageDocuments from "./pages/admin/ManageDocuments";
import LaunchDraw from "./pages/admin/LaunchDraw";
import RunDraw from "./pages/admin/RunDraw";
import ManageWithdrawals from "./pages/admin/ManageWithdrawals";
import Reports from "./pages/admin/Reports";
import DrawHistory from "./pages/admin/DrawHistory";
import ManageSite from "./pages/admin/ManageSite";

// Communicator
import ManageAnnouncements from "./pages/communicator/ManageAnnouncements";
import CreateAnnouncement from "./pages/communicator/CreateAnnouncement";
import ManageSurveys from "./pages/communicator/ManageSurveys";
import CreateSurveyNotice from "./pages/communicator/CreateSurveyNotice";
import IdeaBoxModeration from "./pages/communicator/IdeaBoxModeration";
import ManageNotifications from "./pages/communicator/ManageNotifications";

// System Admin
import ManageFunctionalAdmins from "./pages/system/ManageFunctionalAdmins";
import ManageCommunicators from "./pages/system/ManageCommunicators";
import ManageSystemAdmins from "./pages/system/ManageSystemAdmins";
import AuditLogPage from "./pages/system/AuditLogPage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activities/:slug" element={<ActivityDetail />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/announcements/:slug" element={<AnnouncementDetails />} />

        {/* EMPLOYEE (ALL LOGGED USERS) */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/requests"
          element={<ProtectedRoute><MyRequests /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/draw"
          element={<ProtectedRoute><DrawResults /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/documents"
          element={<ProtectedRoute><Documents /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/surveys"
          element={<ProtectedRoute><Surveys /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/history"
          element={<ProtectedRoute><ParticipationHistory /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/ideas"
          element={<ProtectedRoute><IdeaBox /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/notifications"
          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/catalog"
          element={<ProtectedRoute><ActivitiesCatalog /></ProtectedRoute>}
        />

        {/* FUNCTIONAL ADMIN */}
        <Route
          path="/dashboard/admin/activities"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><ManageActivities /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/activities/create"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><CreateActivity /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/activities/:slug/edit"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><ModifyActivity /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/activities/:id/sessions"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><ManageSessions /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/activities/:id/sessions/create"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><CreateSession /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/activities/:id/sessions/:sessionId"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><SessionDetails /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/activities/:id/sessions/:sessionId/edit"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><EditSession /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/activities/:id/sessions/:sessionId/sites-quotas"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><SitesAndQuotas /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/registrations"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><ManageRegistrations /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/documents"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><ManageDocuments /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/draw"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><LaunchDraw /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/draw/run/:sessionId"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><RunDraw /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/withdrawals"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><ManageWithdrawals /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/reports"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><Reports /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/draw-history"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><DrawHistory /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin/site"
          element={<ProtectedRoute allowedRoles={["FUNCTIONAL_ADMIN"]}><ManageSite /></ProtectedRoute>}
        />

        {/* COMMUNICATOR */}
        <Route
          path="/dashboard/communicator/announcements"
          element={<ProtectedRoute allowedRoles={["COMMUNICATOR"]}><ManageAnnouncements /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/communicator/announcements/create"
          element={<ProtectedRoute allowedRoles={["COMMUNICATOR"]}><CreateAnnouncement /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/communicator/surveys"
          element={<ProtectedRoute allowedRoles={["COMMUNICATOR"]}><ManageSurveys /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/communicator/surveys/create"
          element={<ProtectedRoute allowedRoles={["COMMUNICATOR"]}><CreateSurveyNotice /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/communicator/ideas"
          element={<ProtectedRoute allowedRoles={["COMMUNICATOR"]}><IdeaBoxModeration /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/communicator/notifications"
          element={<ProtectedRoute allowedRoles={["COMMUNICATOR"]}><ManageNotifications /></ProtectedRoute>}
        />

        {/* SYSTEM ADMIN */}
        <Route
          path="/dashboard/system/functional-admins"
          element={<ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}><ManageFunctionalAdmins /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/system/communicators"
          element={<ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}><ManageCommunicators /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/system/system-admins"
          element={<ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}><ManageSystemAdmins /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/system/audit-log"
          element={<ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}><AuditLogPage /></ProtectedRoute>}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;