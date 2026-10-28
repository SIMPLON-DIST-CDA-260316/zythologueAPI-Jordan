import sanitizeHtml from "sanitize-html";

// Liste blanche alignée sur les formats de l'éditeur Quill du dashboard.
// Tout le reste (script, style, img, attributs on*, style=…) est supprimé :
// le dashboard n'est pas le seul client, n'importe qui peut appeler l'API.
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "ol", "ul", "li", "a"],
  allowedAttributes: { a: ["href", "rel", "target"] },
  // Même règle que website : javascript: et data: exécuteraient du code au clic
  allowedSchemes: ["http", "https"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, { href, ...attribs }) => ({
      tagName,
      attribs: {
        ...attribs,
        // allowedSchemes laisse passer les liens relatifs (www.site.fr, /admin) :
        // on n'accepte qu'une URL absolue, comme DOMPurify côté dashboard
        ...(href && /^https?:\/\//i.test(href.trim()) ? { href } : {}),
        // Écrase les rel/target envoyés : le lien s'ouvre sans accès à window.opener
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      },
    }),
  },
};

export const sanitizeRichText = (html: string) =>
  sanitizeHtml(html, RICH_TEXT_OPTIONS).trim();

// Aucun texte visible : éditeur vide (<p><br></p>) ou contenu entièrement supprimé
export const isBlankRichText = (html: string) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim() === "";
