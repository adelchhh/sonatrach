import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import ActivityDetail from "./pages/ActivityDetail";
import Dashboard from "./pages/Dashboard";
import ManageSite from "./pages/admin/ManageSite";
import ManageRegistrations from "./pages/admin/ManageRegistrations";
import ManageActivities from "./pages/admin/ManageActivities";
import ModifyActivity from "./pages/admin/ModifyActivity";
import ManageSessions from "./pages/admin/ManageSessions";
import LaunchDraw from "./pages/admin/LaunchDraw";
import ManageWithdrawals from "./pages/admin/ManageWithdrawals";
import Reports from "./pages/admin/Reports";
import DrawHistory from "./pages/admin/DrawHistory";
import ActivitiesCatalog from "./pages/employee/ActivitiesCatalog";
import MyRequests from "./pages/employee/MyRequests";
import DrawResults from "./pages/employee/DrawResults";
import Documents from "./pages/employee/Documents";
import ParticipationHistory from "./pages/employee/ParticipationHistory";
import Surveys from "./pages/employee/Surveys";
import IdeaBox from "./pages/employee/IdeaBox";
import CreateActivity from "./pages/admin/CreateActivity";
import SessionDetails from "./pages/admin/SessionDetails";
import EditSession from "./pages/admin/EditSession";
import CreateSession from "./pages/admin/CreateSession";
import SitesAndQuotas from "./pages/admin/SitesAndQuotas";
import ManageDocuments from "./pages/admin/ManageDocuments";

import ManageAnnouncements from "./pages/communicator/ManageAnnouncements";
import ManageSurveys from "./pages/communicator/ManageSurveys";
import IdeaBoxModeration from "./pages/communicator/IdeaBoxModeration";
import ManageNotifications from "./pages/communicator/ManageNotifications";
import CreateAnnouncement from "./pages/communicator/CreateAnnouncement";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ScrollToTop from "./components/ScrollToTop";
import AnnouncementDetails from "./pages/AnnouncementDetails";
import CreateSurveyNotice from "./pages/communicator/CreateSurveyNotice";


function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activities/:slug" element={<ActivityDetail />} />
        <Route path="/dashboard/requests" element={<MyRequests />} />
        <Route path="/dashboard/draw" element={<DrawResults />} />
    
        <Route path="/dashboard/admin/draw-history" element={<DrawHistory />} />
        <Route path="/dashboard/surveys" element={<Surveys />} />
        <Route path="/dashboard/history" element={<ParticipationHistory />} />
        <Route path="/dashboard/ideas" element={<IdeaBox />} />
        <Route path="/dashboard/admin/reports" element={<Reports />} />
        <Route
  path="/dashboard/admin/activities/:id/sessions/:sessionId/sites-quotas"
  element={<SitesAndQuotas />}
/>
        <Route path="/dashboard/documents" element={<Documents />} />  
        <Route path="/dashboard/catalog" element={<ActivitiesCatalog />} />
        <Route
  path="/dashboard/admin/activities/create"
  element={<CreateActivity />}
/>
        <Route
  path="/dashboard/admin/withdrawals"
  element={<ManageWithdrawals />}
/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
  path="/dashboard/admin/documents"
  element={<ManageDocuments />}
/>
        <Route path="/dashboard/admin/draw" element={<LaunchDraw />} />

<Route
  path="/dashboard/admin/activities/:id/sessions"
  element={<ManageSessions />}
/>

<Route
  path="/dashboard/communicator/surveys"
  element={<ManageSurveys />}
/>
<Route
  path="/dashboard/communicator/ideas"
  element={<IdeaBoxModeration />}
/>
<Route
  path="/dashboard/communicator/announcements"
  element={<ManageAnnouncements />}
/>
<Route
  path="/dashboard/communicator/notifications"
  element={<ManageNotifications />}
/>
<Route
  path="/dashboard/communicator/announcements/create"
  element={<CreateAnnouncement />}
/>
<Route path="/announcements" element={<AnnouncementsPage />} />
<Route
  path="/announcements/:slug"
  element={<AnnouncementDetails />}
/>
<Route
  path="/dashboard/communicator/surveys/create"
  element={<CreateSurveyNotice />}
/>


<Route
  path="/dashboard/admin/activities/:id/sessions/create"
  element={<CreateSession />}
 />

<Route
  path="/dashboard/admin/activities/:id/sessions/:sessionId"
  element={<SessionDetails />}
 />

<Route
  path="/dashboard/admin/activities/:id/sessions/:sessionId/edit"
  element={<EditSession />}
 />
        <Route path="/dashboard/admin/site" element={<ManageSite />} />
        <Route
  path="/dashboard/admin/activities/:slug/edit"
  element={<ModifyActivity />}
/>
        <Route path="/dashboard/admin/activities" element={<ManageActivities />} />
        <Route
  path="/dashboard/admin/registrations"
  element={<ManageRegistrations />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;