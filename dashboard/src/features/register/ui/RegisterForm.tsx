import { cn } from "cn";

import { register } from "@/entities/session";
import { useFormValidation } from "@/shared/lib/hooks/use-form-validation";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/shared/ui/field";
import { FormField } from "@/shared/ui/form-field";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { registerFormSchema } from "../model/schema";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Compte créé, vous pouvez vous connecter");
      navigate("/login");
    },
  });
  const { parse, errorsFor } = useFormValidation(registerFormSchema, error);

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
          <CardTitle className="text-xl">Créer votre compte</CardTitle>
          <CardDescription>
            Renseignez vos informations pour créer votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* noValidate : les attributs HTML restent (clavier mobile,
              accessibilité) mais c'est Zod qui affiche les erreurs */}
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field className="grid grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  label="Prénom"
                  type="text"
                  maxLength={100}
                  required
                  errors={errorsFor("firstName")}
                />
                <FormField
                  name="lastName"
                  label="Nom"
                  type="text"
                  maxLength={100}
                  required
                  errors={errorsFor("lastName")}
                />
              </Field>
              <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="email@example.com"
                maxLength={255}
                required
                errors={errorsFor("email")}
              />
              <FormField
                name="birthDate"
                label="Date de naissance"
                type="date"
                min="1900-01-01"
                required
                errors={errorsFor("birthDate")}
              />
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <FormField
                    name="password"
                    label="Mot de passe"
                    type="password"
                    minLength={8}
                    maxLength={255}
                    required
                    errors={errorsFor("password")}
                  />
                  <FormField
                    name="confirmPassword"
                    label="Confirmer mot de passe"
                    type="password"
                    required
                    errors={errorsFor("confirmPassword")}
                  />
                </Field>
                <FieldDescription>
                  8 caractères minimum, avec une majuscule, une minuscule, un
                  chiffre et un caractère spécial
                </FieldDescription>
              </Field>
              <Field>
                {error && <FieldError>{error.message}</FieldError>}
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Création…" : "Créer un compte"}
                </Button>

                <FieldDescription className="text-center">
                  Vous avez déjà un compte ?{" "}
                  <Link to="/login">Se connecter</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
