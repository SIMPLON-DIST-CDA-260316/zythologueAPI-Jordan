import Quill from "quill";
import type LinkFormat from "quill/formats/link";
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";
import "./rich-text-editor.css";

// Mêmes formats que la liste blanche de l'API (api/src/schemas/richText.ts).
// Ni formula ni video (CVE-2025-15056 : export HTML non échappé), ni image
// (collée en base64 dans la colonne). Le collage est filtré par la même liste.
const FORMATS = ["bold", "italic", "underline", "list", "link"];
const TOOLBAR = [
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

// Un lien saisi sans protocole (www.site.fr) resterait relatif, et l'API lui
// retirerait son href : on ajoute https://. Les protocoles interdits
// (javascript:…) sont toujours remplacés par about:blank par Quill.
const Link = Quill.import("formats/link") as typeof LinkFormat;
class HttpsLink extends Link {
  static sanitize(url: string) {
    return super.sanitize(
      /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`,
    );
  }
}
Quill.register(HttpsLink, true);

type RichTextEditorProps = {
  name: string; // nom du champ caché lu par FormData
  defaultValue?: string;
  labelId: string; // id du FieldLabel : un <label for> ne cible pas une div éditable
  invalid?: boolean;
  placeholder?: string;
};

// Éditeur non contrôlé, comme les autres champs des formulaires : le HTML est
// recopié dans un <input type="hidden"> que le submit lit avec FormData.
// Quill est utilisé directement : react-quill dépend de findDOMNode, retiré de React 19.
export function RichTextEditor({
  name,
  defaultValue = "",
  labelId,
  invalid = false,
  placeholder,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<Quill>(null);

  // Le formulaire est remonté (key) à chaque ouverture : les props ne changent
  // pas pendant la vie de l'éditeur, il n'est créé qu'une fois
  useEffect(() => {
    const container = containerRef.current!;
    const quill = new Quill(
      container.appendChild(document.createElement("div")),
      {
        theme: "snow",
        formats: FORMATS,
        modules: { toolbar: TOOLBAR },
        placeholder,
        bounds: container, // l'infobulle des liens reste dans le Sheet
      },
    );
    // convert applique les mêmes formats autorisés que le collage
    quill.setContents(
      quill.clipboard.convert({ html: defaultValue }),
      "silent",
    );
    quill.root.setAttribute("role", "textbox");
    quill.root.setAttribute("aria-multiline", "true");
    quill.root.setAttribute("aria-labelledby", labelId);
    quill.on("text-change", () => {
      // Quill 2.0.3 remplace chaque espace par &nbsp; : le texte affiché ne
      // passerait plus à la ligne. Éditeur vide (<p><br></p>) → "" pour Zod
      inputRef.current!.value =
        quill.getText().trim() === ""
          ? ""
          : quill.getSemanticHTML().replaceAll("&nbsp;", " ");
    });
    quillRef.current = quill;

    // StrictMode monte deux fois en dev : sans ce nettoyage, deux barres d'outils
    return () => {
      container.replaceChildren();
      quillRef.current = null;
    };
  }, [defaultValue, labelId, placeholder]);

  useEffect(() => {
    quillRef.current?.root.setAttribute("aria-invalid", String(invalid));
  }, [invalid]);

  return (
    <>
      <div ref={containerRef} className="rich-text-editor" />
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue}
      />
    </>
  );
}
