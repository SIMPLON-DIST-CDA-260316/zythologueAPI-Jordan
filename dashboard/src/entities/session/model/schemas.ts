import { z } from "zod";

// ponytail: règles recopiées de api/src/schemas/authSchema.ts (même messages),
// à extraire dans un package partagé si elles se mettent à diverger.
// Côté front, Zod sert l'UX ; l'API revalide tout et reste l'autorité.

const emailSchema = z
  .string()
  .trim()
  .max(255)
  .toLowerCase()
  .pipe(z.email("Ce champ doit être une adresse email valide"));

export const registerSchema = z.object({
  lastName: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Ce champ doit comprendre au moins 1 caractère")
    .max(100, "Ce champ ne peut pas comprendre plus de 100 caractères"),
  firstName: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Ce champ doit comprendre au moins 1 caractère")
    .max(100, "Ce champ ne peut pas comprendre plus de 100 caractères"),
  email: emailSchema,
  birthDate: z.iso
    .date("La date de naissance doit être valide")
    .refine(
      (date) => {
        const today = new Date();
        const year = today.getFullYear() - 18;
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return date <= `${year}-${month}-${day}`;
      },
      { message: "Vous devez avoir au moins 18 ans pour vous inscrire" },
    )
    .refine((date) => date >= "1900-01-01", {
      message: "La date de naissance doit être valide",
    }),
  password: z
    .string("Ce champ doit être une chaîne de caractères")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(255)
    .regex(/\p{Ll}/u, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/\p{Lu}/u, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[^\p{L}\p{N}]/u,
      "Le mot de passe doit contenir au moins un caractère spécial",
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string("Ce champ doit être une chaîne de caractères")
    .min(1, "Ce champ doit comporter au minimum un caractère")
    .max(255),
});

export type LoginInput = z.infer<typeof loginSchema>;
