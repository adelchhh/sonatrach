import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import DashboardMain from "../components/dashboard/DashboardMain";
import DashboardRightPanel from "../components/dashboard/DashboardRightPanel";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <div className="flex-1 flex overflow-hidden">
          <DashboardMain />
          <DashboardRightPanel />
        </div>
      </div>
    </div>
  );
}