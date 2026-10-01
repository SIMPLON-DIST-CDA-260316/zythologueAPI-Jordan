import { RegisterForm } from "@/features/register";
import { BeerIcon } from "lucide-react";

export function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <span className="flex items-center gap-2 self-center font-medium">
          <BeerIcon className="size-5" /> Zythologue
        </span>
        <RegisterForm />
      </div>
    </div>
  );
}
