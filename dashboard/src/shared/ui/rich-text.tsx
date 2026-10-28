import { cn } from "@/shared/lib/utils";
import DOMPurify from "dompurify";

// Même liste blanche que l'API (api/src/schemas/richText.ts). L'API nettoie
// déjà à l'écriture : ce second passage protège d'une donnée insérée sans
// passer par elle (SQL direct, ancienne version, API compromise).
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li", "a"],
  ALLOWED_ATTR: ["href", "rel", "target"],
  // Par défaut DOMPurify accepte aussi mailto:, tel:… : on s'aligne sur http(s)
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
};

// Lien ouvert dans un nouvel onglet sans accès à window.opener
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName !== "A") return;
  node.setAttribute("rel", "noopener noreferrer nofollow");
  node.setAttribute("target", "_blank");
});

type RichTextProps = {
  html: string;
  className?: string;
};

// Affiche une description saisie avec l'éditeur. Seul dangerouslySetInnerHTML
// de l'application : tout HTML venant de l'API doit passer par ce composant.
// Le preflight de Tailwind retire puces et marges : on les remet ici.
// a[href] seulement : un lien refusé par l'API (javascript:…) n'a plus de href
// et doit s'afficher comme du texte.
export function RichText({ html, className }: RichTextProps) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed [&_:is(ul,ol)]:pl-5 [&_a[href]]:text-primary [&_a[href]]:underline [&_a[href]]:underline-offset-4 [&_ol]:list-decimal [&_ul]:list-disc [&>*+*]:mt-2",
        className,
      )}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html, PURIFY_CONFIG),
      }}
    />
  );
}
