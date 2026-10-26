import { cn } from "cn";

import { login, loginSchema, ME_QUERY_KEY } from "@/entities/session";
import { useFormValidation } from "@/shared/lib/hooks/use-form-validation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/shared/ui/field";
import { FormField } from "@/shared/ui/form-field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      // Recharge /auth/me : une fois l'utilisateur dans le cache, GuestOnly
      // redirige vers "/". Le await garde le bouton en "Connexion…" jusque-là.
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      toast.success("Connexion réussie!");
    },
  });
  const { parse, errorsFor } = useFormValidation(loginSchema, error);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset(); // efface l'erreur API de la tentative précédente
    const data = parse(event.currentTarget);
    if (data) mutate(data);
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
              <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="email@example.com"
                required
                errors={errorsFor("email")}
              />
              <FormField
                name="password"
                label="Mot de passe"
                type="password"
                required
                errors={errorsFor("password")}
              />
              <Field>
                {error && <FieldError>{error.message}</FieldError>}
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
