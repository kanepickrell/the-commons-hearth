import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { AuthProvider } from "@/auth/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { routes } from "@/i18n/routes";
import Home from "./pages/Home.tsx";

// Every page except Home is loaded on demand. The admin page alone pulls in
// leaflet-draw and six panels; visitors who never sign in shouldn't download it.
const Vision       = lazy(() => import("./pages/Vision.tsx"));
const Participate  = lazy(() => import("./pages/Participate.tsx"));
const Resources    = lazy(() => import("./pages/Resources.tsx"));
const MemberDetail = lazy(() => import("./pages/MemberDetail.tsx"));
const Talleres     = lazy(() => import("./pages/Talleres.tsx"));
const TallerDetail = lazy(() => import("./pages/TallerDetail.tsx"));
const Testimonio   = lazy(() => import("./pages/Testimonio.tsx"));
const Santo        = lazy(() => import("./pages/Santo.tsx"));
const Bienvenido   = lazy(() => import("./pages/Bienvenido.tsx"));
const MiPerfil     = lazy(() => import("./pages/MiPerfil.tsx"));
const Mayordomo    = lazy(() => import("./pages/Mayordomo.tsx"));
const NuevaReunion = lazy(() => import("./pages/NuevaReunion.tsx"));
const NotFound     = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

// Matches the in-page "…" placeholders so a chunk load doesn't flash a layout.
const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-cal font-serif text-mesquite/60">…</div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LocaleProvider>
            <AuthProvider>
              <ScrollToTop />
              <Suspense fallback={<PageFallback />}>
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
                  <Route path="/ofrendas"      element={<Navigate to="/vision" replace />} />
                  <Route path="/offerings"     element={<Navigate to="/vision" replace />} />
                  <Route path="/ofrendas/:id"  element={<LegacyOfrendaRedirect />} />
                  <Route path="/offerings/:id" element={<LegacyOfrendaRedirect lang="en" />} />

                  <Route path={routes.memberDetail.es} element={<MemberDetail />} />
                  <Route path={routes.memberDetail.en} element={<MemberDetail />} />

                  {/* /workshops/new must be declared before /workshops/:id */}
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
              </Suspense>
            </AuthProvider>
          </LocaleProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Small redirect helper so bookmarks/old links keep working.
function LegacyOfrendaRedirect({ lang = 'es' }: { lang?: 'en' | 'es' }) {
  const { id } = useParams<{ id: string }>();
  const base = lang === 'en' ? '/members' : '/miembros';
  return <Navigate to={`${base}/${id ?? ''}`} replace />;
}

export default App;
