import { ApiError, apiFetch } from "@/shared/api";
import type { LoginInput, RegisterInput, User } from "../model/types";

export const register = (input: RegisterInput) =>
  apiFetch<User>("/auth/register", { method: "POST", body: input });

// Le JWT n'apparaît pas dans la réponse : l'API le dépose dans un cookie httpOnly
export const login = (input: LoginInput) =>
  apiFetch<{ message: string }>("/auth/login", { method: "POST", body: input });

export const logout = () => apiFetch<void>("/auth/logout", { method: "POST" });

// Pas connecté n'est pas une erreur : 401 → null
export async function getMe(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
