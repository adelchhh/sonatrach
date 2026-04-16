import { Link } from "react-router-dom";
import { activities } from "../../data/activities";

function ActivityCard({ activity, featured = false }) {
  return (
    <Link
      to={`/activities/${activity.slug}`}
      className={`relative overflow-hidden rounded-[24px] block group ${
        featured ? "h-[340px]" : "h-[300px]"
      }`}
    >
      <img
        src={activity.image}
        alt={activity.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(47,52,59,0.12) 0%, rgba(47,52,59,0.20) 45%, rgba(47,52,59,0.82) 100%)",
        }}
      />

      <div className="absolute top-4 left-4">
        <span className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.92)] text-[#2F343B] text-xs font-semibold">
          {activity.category}
        </span>
      </div>

      <div className="absolute top-4 right-4">
        <span className="px-3 py-1.5 rounded-full bg-[rgba(47,52,59,0.72)] text-white text-xs font-medium">
          {activity.status}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white text-[22px] font-bold leading-[110%] mb-2">
          {activity.title}
        </h3>
        <div className="text-[rgba(255,255,255,0.82)] text-sm">
          {activity.location} · {activity.date}
        </div>
      </div>
    </Link>
  );
}

export default function CatalogContent({ compact = false }) {
  const featured = activities.slice(0, 2);
  const others = activities.slice(2);

  return (
    <div className={compact ? "" : "px-4 py-10"}>
      <div className="w-full max-w-[1336px] mx-auto">
        <div className={`text-center ${compact ? "mb-8" : "mb-10"}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#E5E2DC] bg-white text-[#7A8088] text-sm mb-4">
            Catalog
          </div>

          <h1 className="text-[#2F343B] text-[56px] font-extrabold leading-[100%] tracking-[-2px] mb-4">
            Explore Activities
          </h1>

          <p className="text-[#7A8088] text-lg leading-[170%] max-w-[700px] mx-auto">
            Find your next adventure, workshop, or community event. Browse through
            all available opportunities designed for employees.
          </p>
        </div>

        <div className="mb-8 rounded-[20px] border border-[#E5E2DC] bg-white p-4 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search destinations, events..."
            className="flex-1 min-w-[220px] px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none"
          />

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            All Types
          </button>

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            Upcoming
          </button>

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            Open only
          </button>

          <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white font-medium">
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ActivityCard activity={featured[0]} featured />
          </div>

          <div>
            <ActivityCard activity={featured[1]} featured />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {others.map((activity) => (
            <ActivityCard key={activity.slug} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}