import { cn } from "cn";

import { register, type RegisterInput } from "@/entities/session";
import { ApiError } from "@/shared/api";
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
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FieldError attend [{ message }], l'API renvoie ["…"] : on convertit
  const errorsFor = (name: string) =>
    fieldErrors[name]?.map((message) => ({ message }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const { confirmPassword, ...body } = Object.fromEntries(
      new FormData(event.currentTarget),
    );

    if (body.password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: ["Les mots de passe ne correspondent pas"],
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // ponytail: cast temporaire, remplacé par le parse Zod à l'étape 3
      await register(body as RegisterInput);
      toast.success("Compte créé, vous pouvez vous connecter");
      navigate("/login");
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      setFormError(err.message);
      setFieldErrors(err.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
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
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    name="firstName"
                    maxLength={100}
                    required
                    aria-invalid={!!fieldErrors.firstName}
                  />
                  <FieldError errors={errorsFor("firstName")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    name="lastName"
                    maxLength={100}
                    required
                    aria-invalid={!!fieldErrors.lastName}
                  />
                  <FieldError errors={errorsFor("lastName")} />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  maxLength={255}
                  required
                  aria-invalid={!!fieldErrors.email}
                />
                <FieldError errors={errorsFor("email")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="birthDate">Date de naissance</FieldLabel>
                <Input
                  id="birthDate"
                  type="date"
                  name="birthDate"
                  min="1900-01-01"
                  required
                  aria-invalid={!!fieldErrors.birthDate}
                />
                <FieldError errors={errorsFor("birthDate")} />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      minLength={8}
                      maxLength={255}
                      required
                      aria-invalid={!!fieldErrors.password}
                    />
                    <FieldError errors={errorsFor("password")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirmer mot de passe
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      required
                      aria-invalid={!!fieldErrors.confirmPassword}
                    />
                    <FieldError errors={errorsFor("confirmPassword")} />
                  </Field>
                </Field>
                <FieldDescription>
                  8 caractères minimum, avec une majuscule, une minuscule, un
                  chiffre et un caractère spécial
                </FieldDescription>
              </Field>
              <Field>
                {formError && <FieldError>{formError}</FieldError>}
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création…" : "Créer un compte"}
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
