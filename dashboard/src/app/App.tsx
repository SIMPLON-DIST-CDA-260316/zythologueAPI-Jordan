import { AuthProvider } from "@/entities/session";
import { DashboardPage } from "@/pages/dashboard";
import { ForbiddenPage } from "@/pages/forbidden";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { Toaster } from "@/shared/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { GuestOnly, RequireAdmin, RequireAuth } from "./guards";

// Hors du composant : un seul cache pour toute la durée de vie de l'app
const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route element={<RequireAdmin />}>
                <Route path="/" element={<DashboardPage />} />
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
