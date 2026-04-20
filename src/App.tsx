import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { routes } from "@/i18n/routes";
import Home from "./pages/Home.tsx";
import Ofrendas from "./pages/Ofrendas.tsx";
import OfrendaDetail from "./pages/OfrendaDetail.tsx";
import Talleres from "./pages/Talleres.tsx";
import TallerDetail from "./pages/TallerDetail.tsx";
import Testimonio from "./pages/Testimonio.tsx";
import Santo from "./pages/Santo.tsx";
import Bienvenido from "./pages/Bienvenido.tsx";
import MiPerfil from "./pages/MiPerfil.tsx";
import Mayordomo from "./pages/Mayordomo.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Each page has two routes — Spanish and English slug — both render the same component.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LocaleProvider>
          <Routes>
            <Route path={routes.home.en} element={<Home />} />

            <Route path={routes.ofrendas.es} element={<Ofrendas />} />
            <Route path={routes.ofrendas.en} element={<Ofrendas />} />
            <Route path={routes.ofrendaDetail.es} element={<OfrendaDetail />} />
            <Route path={routes.ofrendaDetail.en} element={<OfrendaDetail />} />

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

export default App;