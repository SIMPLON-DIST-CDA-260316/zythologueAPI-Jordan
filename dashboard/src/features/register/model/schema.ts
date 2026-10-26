import { registerSchema } from "@/entities/session";
import { z } from "zod";

// La confirmation n'existe que dans le formulaire : l'API ne la connaît pas,
// on la retire donc des données envoyées (transform).
// Pas de règles de robustesse dessus : l'égalité avec password suffit.
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  })
  .transform(({ confirmPassword, ...input }) => input);
