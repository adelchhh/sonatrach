import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background watermark */}
        <div
          aria-hidden
          className="absolute leading-none pointer-events-none select-none"
          style={{
            fontSize: "clamp(280px, 40vw, 480px)",
            fontWeight: 900,
            letterSpacing: "-0.06em",
            color: "rgba(10,10,10,0.03)",
          }}
        >
          404
        </div>

        <div className="relative z-10 text-center max-w-[640px] px-8">
          <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.42em] font-bold mb-5">
            Erreur 404
          </p>
          <h1
            className="text-[#0A0A0A] font-bold tracking-[-0.025em] leading-[1.05] mb-6"
            style={{ fontSize: "clamp(40px, 6vw, 76px)" }}
          >
            Page introuvable
          </h1>
          <p className="text-[#525252] text-[15px] leading-[1.75] mb-9 max-w-[480px] mx-auto">
            La page que vous cherchez n'existe pas, a été déplacée ou n'est plus
            accessible. Revenez à l'accueil pour continuer votre navigation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[12px] uppercase tracking-[0.18em] font-bold text-[#0A0A0A] transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              Retour
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#ED8D31] text-black text-[12px] uppercase tracking-[0.18em] font-bold hover:bg-[#fa9d40] transition-colors"
            >
              <Home size={14} strokeWidth={2.5} />
              Accueil
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
