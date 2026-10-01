import { cn } from "cn";

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
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Link } from "react-router";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
          <form>
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
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    name="lastName"
                    maxLength={100}
                    required
                  />
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
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="birthDate">Date de naissance</FieldLabel>
                <Input
                  id="birthDate"
                  type="date"
                  name="birthDate"
                  min="1900-01-01"
                  required
                />
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
                    />
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
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  8 caractères minimum, avec une majuscule, une minuscule, un
                  chiffre et un caractère spécial
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="cursor-pointer">
                  Créer un compte
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
