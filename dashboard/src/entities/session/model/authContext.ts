import { createContext, useContext } from "react";
import type { User } from "./types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return value;
}
