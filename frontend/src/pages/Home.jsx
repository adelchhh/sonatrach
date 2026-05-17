import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AnnouncementsSection from "../components/AnnouncementsSection";
import ActivitiesSection from "../components/ActivitiesSection";
import IdeasSection from "../components/IdeasSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <Navbar />
      <HeroSection />

      <section id="announcements">
        <AnnouncementsSection />
      </section>

      <section id="activities">
        <ActivitiesSection />
      </section>

      <section id="ideas">
        <IdeasSection />
      </section>

      <Footer />
    </div>
  );
}