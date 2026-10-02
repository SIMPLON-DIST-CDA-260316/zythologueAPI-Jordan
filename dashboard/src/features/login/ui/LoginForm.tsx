import { cn } from "cn";

import { login, type LoginInput } from "@/entities/session";
import { ApiError } from "@/shared/api";
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
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export function LoginForm({
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

    const body = Object.fromEntries(new FormData(event.currentTarget));

    setIsSubmitting(true);
    try {
      // ponytail: cast temporaire, remplacé par le parse Zod à l'étape 3
      await login(body as LoginInput);
      toast.success("Connexion réussie!");
      navigate("/");
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
          <CardTitle className="text-xl">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Connexion…" : "Se connecter"}
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
