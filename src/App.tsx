import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { routes } from "@/i18n/routes";
import Home from "./pages/Home.tsx";
import Vision from "./pages/Vision.tsx";
import Participate from "./pages/Participate.tsx";
import Resources from "./pages/Resources.tsx";
import MemberDetail from "./pages/MemberDetail.tsx";
import Talleres from "./pages/Talleres.tsx";
import TallerDetail from "./pages/TallerDetail.tsx";
import Testimonio from "./pages/Testimonio.tsx";
import Santo from "./pages/Santo.tsx";
import Bienvenido from "./pages/Bienvenido.tsx";
import MiPerfil from "./pages/MiPerfil.tsx";
import Mayordomo from "./pages/Mayordomo.tsx";
import NotFound from "./pages/NotFound.tsx";
import NuevaReunion from "./pages/NuevaReunion.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LocaleProvider>
          <ScrollToTop />
          <Routes>
            <Route path={routes.home.en} element={<Home />} />

            {/* Vision — same slug in both locales */}
            <Route path={routes.vision.en} element={<Vision />} />

            {/* Participate — separate EN and ES slugs */}
            <Route path={routes.participate.en} element={<Participate />} />
            <Route path={routes.participate.es} element={<Participate />} />

            {/* Resources — separate EN and ES slugs */}
            <Route path={routes.resources.en} element={<Resources />} />
            <Route path={routes.resources.es} element={<Resources />} />

            {/* Legacy /ofrendas URLs redirect to /vision */}
            <Route path="/ofrendas"     element={<Navigate to="/vision" replace />} />
            <Route path="/offerings"    element={<Navigate to="/vision" replace />} />
            <Route path="/ofrendas/:id" element={<LegacyOfrendaRedirect />} />
            <Route path="/offerings/:id" element={<LegacyOfrendaRedirect lang="en" />} />

            <Route path={routes.memberDetail.es} element={<MemberDetail />} />
            <Route path={routes.memberDetail.en} element={<MemberDetail />} />

            <Route path={routes.nuevaReunion.es} element={<NuevaReunion />} />
            <Route path={routes.nuevaReunion.en} element={<NuevaReunion />} />

            <Route path={routes.talleres.es} element={<Talleres />} />
            <Route path={routes.talleres.en} element={<Talleres />} />

            <Route path={routes.tallerDetail.es} element={<TallerDetail />} />
            <Route path={routes.tallerDetail.en} element={<TallerDetail />} />

            <Route path={routes.testimonio.es} element={<Testimonio />} />
            <Route path={routes.testimonio.en} element={<Testimonio />} />

            <Route path={routes.santo.es} element={<Santo />} />
            <Route path={routes.santo.en} element={<Santo />} />

            <Route path={routes.bienvenido.es} element={<Bienvenido />} />
            <Route path={routes.bienvenido.en} element={<Bienvenido />} />

            <Route path={routes.miPerfil.es} element={<MiPerfil />} />
            <Route path={routes.miPerfil.en} element={<MiPerfil />} />

            <Route path={routes.mayordomo.es} element={<Mayordomo />} />
            <Route path={routes.mayordomo.en} element={<Mayordomo />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LocaleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Small redirect helper so bookmarks/old links keep working.
function LegacyOfrendaRedirect({ lang = 'es' }: { lang?: 'en' | 'es' }) {
  const id = window.location.pathname.split('/').filter(Boolean).pop();
  const base = lang === 'en' ? '/members' : '/miembros';
  return <Navigate to={`${base}/${id}`} replace />;
}

export default App;