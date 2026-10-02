import { cn } from "cn";

import { login, loginSchema, ME_QUERY_KEY } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const queryClient = useQueryClient();
  // Seules les erreurs Zod restent en state local : chargement et erreurs API
  // sont gérés par la mutation
  const [zodErrors, setZodErrors] = useState<Record<string, string[]>>({});
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      // Recharge /auth/me : une fois l'utilisateur dans le cache, GuestOnly
      // redirige vers "/". Le await garde le bouton en "Connexion…" jusque-là.
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      toast.success("Connexion réussie!");
    },
  });

  const formError = error?.message;
  const fieldErrors = { ...error?.fieldErrors, ...zodErrors };

  // FieldError attend [{ message }], l'API renvoie ["…"] : on convertit
  const errorsFor = (name: string) =>
    fieldErrors[name]?.map((message) => ({ message }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset(); // efface l'erreur API de la tentative précédente

    const result = loginSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setZodErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setZodErrors({});
    mutate(result.data);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          {/* noValidate : les attributs HTML restent (clavier mobile,
              accessibilité) mais c'est Zod qui affiche les erreurs */}
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  required
                  aria-invalid={!!fieldErrors.email}
                />
                <FieldError errors={errorsFor("email")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  aria-invalid={!!fieldErrors.password}
                />
                <FieldError errors={errorsFor("password")} />
              </Field>
              <Field>
                {formError && <FieldError>{formError}</FieldError>}
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? "Connexion…" : "Se connecter"}
                </Button>
                <FieldDescription className="text-center">
                  Vous n'avez pas de compte ?{" "}
                  <Link to="/register">Créer un compte</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
