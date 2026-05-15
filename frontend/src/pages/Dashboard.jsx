import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import DashboardMain from "../components/dashboard/DashboardMain";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />
        <DashboardMain />
      </div>
    </div>
  );
}