import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const defaultImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

export default function DashboardMain() {
  const [dashboardData, setDashboardData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardRes, activitiesRes] = await Promise.all([
          fetch("http://127.0.0.1:8001/api/dashboard"),
          fetch("http://127.0.0.1:8001/api/activities"),
        ]);

        const dashboardJson = await dashboardRes.json();
        const activitiesJson = await activitiesRes.json();

        setDashboardData(dashboardJson.data);
        setActivities(activitiesJson.data || []);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-[#F7F7F5]">
        <div className="p-6 text-[#7A8088]">Loading dashboard...</div>
      </main>
    );
  }

  const stats = [
    {
      icon: "📌",
      label: "Open activities",
      value: dashboardData?.active_activities ?? 0,
      sub: "Available to apply right now",
      to: "/dashboard/catalog",
    },
    {
      icon: "⏳",
      label: "Pending requests",
      value: dashboardData?.pending_registrations ?? 0,
      sub: "Waiting for validation or draw",
      to: "/dashboard/requests",
    },
    {
      icon: "📊",
      label: "Total activities",
      value: dashboardData?.total_activities ?? 0,
      sub: "Available opportunities",
      to: "/dashboard/catalog",
    },
  ];

  const featuredActivities = activities.slice(0, 3);

  return (
    <main className="flex-1 overflow-y-auto bg-[#F7F7F5]">
      <div className="p-6 space-y-6">
        <div className="rounded-[24px] bg-gradient-to-r from-[#2F343B] to-[#5A6470] text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 w-72 h-72 bg-[#ED8D31] rounded-full blur-3xl" />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold leading-tight mb-2">
              Welcome back!
            </h1>

            <p className="text-[rgba(255,255,255,0.88)] max-w-[620px] leading-[170%]">
              Explore available activities, track your requests, confirm your
              participation, and keep your documents ready in one clear space.
            </p>

            <Link
              to="/dashboard/catalog"
              className="inline-block mt-5 px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
            >
              Explore Activities
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Link
              key={i}
              to={stat.to}
              className="rounded-[20px] bg-white p-5 border border-[#E5E2DC] hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#7A8088]">
                  {stat.label}
                </h3>
                <span className="text-xl">{stat.icon}</span>
              </div>

              <p className="text-3xl font-extrabold text-[#2F343B]">
                {stat.value}
              </p>

              <p className="text-xs text-[#7A8088] mt-1">{stat.sub}</p>
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2F343B]">
              Activities you can apply for
            </h2>

            <Link
              to="/dashboard/catalog"
              className="text-[#ED8D31] text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              View catalog
            </Link>
          </div>

          {featuredActivities.length === 0 ? (
            <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5 text-[#7A8088]">
              No activities available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {featuredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-[20px] bg-white border border-[#E5E2DC] overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-[180px] overflow-hidden">
                    <img
                      src={activity.image || defaultImage}
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3 inline-flex px-3 py-1 rounded-full bg-[rgba(255,255,255,0.9)] text-xs font-semibold text-[#2F343B]">
                      {activity.category}
                    </div>

                    <div className="absolute top-3 right-3 inline-flex px-3 py-1 rounded-full bg-[rgba(47,52,59,0.78)] text-xs font-semibold text-white">
                      {activity.status}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-[#2F343B] text-sm mb-2">
                      {activity.title}
                    </h3>

                    <p className="text-xs text-[#7A8088] leading-[170%] line-clamp-2">
                      {activity.description}
                    </p>

                    <Link
                      to={`/activities/${activity.id}`}
                      className="text-[#ED8D31] text-xs font-semibold mt-3 inline-block hover:opacity-80 transition-opacity"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
          <h2 className="text-lg font-bold text-[#2F343B] mb-2">
            My requests
          </h2>

          <p className="text-sm text-[#7A8088]">
            Request data will be connected when we build registrations.
          </p>
        </div>

        <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
          <h2 className="text-lg font-bold text-[#2F343B] mb-2">
            Participation history
          </h2>

          <p className="text-sm text-[#7A8088]">
            Participation history will be connected after registrations and draw
            results are implemented.
          </p>
        </div>
      </div>
    </main>
  );
}