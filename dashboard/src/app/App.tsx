import { AuthProvider, ME_QUERY_KEY } from "@/entities/session";
import { BeerLogsPage } from "@/pages/beer-logs";
import { BeersPage } from "@/pages/beers";
import { BreweriesPage } from "@/pages/breweries";
import { CategoriesPage } from "@/pages/categories";
import { DashboardPage } from "@/pages/dashboard";
import { ForbiddenPage } from "@/pages/forbidden";
import { IngredientsPage } from "@/pages/ingredients";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import type { ApiError } from "@/shared/api";
import { Toaster } from "@/shared/ui/sonner";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { toast } from "sonner";
import { GuestOnly, RequireAdmin, RequireAuth } from "./guards";
import { AdminLayout } from "./layouts/AdminLayout";

// Session expirée en cours d'utilisation : on vide l'utilisateur du cache,
// les guards redirigent vers /login (getMe gère déjà son propre 401)
function handleUnauthorized(error: ApiError) {
  if (error.status !== 401) return;
  queryClient.setQueryData(ME_QUERY_KEY, null);
  toast.error("Session expirée, reconnectez-vous", { id: "session-expired" });
}

// Hors du composant : un seul cache pour toute la durée de vie de l'app
const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route element={<RequireAdmin />}>
                <Route element={<AdminLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/bieres" element={<BeersPage />} />
                  <Route path="/brasseries" element={<BreweriesPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/ingredients" element={<IngredientsPage />} />
                  <Route path="/journal" element={<BeerLogsPage />} />
                </Route>
              </Route>
              <Route path="/acces-refuse" element={<ForbiddenPage />} />
            </Route>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Routes>
          <Toaster position="top-center" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
