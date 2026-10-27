import { Input } from "@/shared/ui/input";
import { SearchIcon } from "lucide-react";

type SearchInputProps = {
  value: string | undefined;
  onSearch: (value: string) => void;
  placeholder: string;
  label: string;
};

// Recherche validée par Entrée : une requête par recherche, pas par frappe.
// La key resynchronise le champ quand l'URL change (retour, réinitialisation)
export function SearchInput({
  value,
  onSearch,
  placeholder,
  label,
}: SearchInputProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = new FormData(event.currentTarget).get("search");
    onSearch(typeof search === "string" ? search.trim() : "");
  }

  return (
    <form
      key={value ?? ""}
      role="search"
      onSubmit={handleSubmit}
      className="relative w-full sm:w-64"
    >
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={label}
        maxLength={100}
        className="pl-8"
      />
    </form>
  );
}
