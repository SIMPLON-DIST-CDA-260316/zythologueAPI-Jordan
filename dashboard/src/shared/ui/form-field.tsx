import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

// Champ texte complet : label relié, aria-invalid et erreurs. Les autres
// props (type, required, maxLength, defaultValue…) vont à l'Input.
type FormFieldProps = Omit<React.ComponentProps<typeof Input>, "name"> & {
  name: string;
  label: string;
  errors?: Array<{ message: string }>;
};

export function FormField({ name, label, errors, ...inputProps }: FormFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        name={name}
        aria-invalid={!!errors?.length}
        {...inputProps}
      />
      <FieldError errors={errors} />
    </Field>
  );
}
