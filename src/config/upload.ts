import path from "node:path";

/**
 * Constantes partagées par le middleware Multer, le service image et la doc OpenAPI.
 * Un seul endroit à modifier pour ajuster un seuil.
 */

export const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
export const BEER_PHOTOS_DIR = path.join(UPLOADS_ROOT, "beers");
export const BEER_THUMBS_DIR = path.join(BEER_PHOTOS_DIR, "thumbs");

/** Préfixe public correspondant au montage express.static dans app.ts */
export const UPLOADS_PUBLIC_PATH = "/uploads";
export const BEER_PHOTOS_PUBLIC_PATH = `${UPLOADS_PUBLIC_PATH}/beers`;
export const BEER_THUMBS_PUBLIC_PATH = `${BEER_PHOTOS_PUBLIC_PATH}/thumbs`;

/** Taille maximale acceptée par Multer, avant tout décodage. */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

/**
 * Garde-fou anti « decompression bomb » : un fichier de 20 ko peut déclarer
 * une image de 50 000 x 50 000 px et saturer la RAM au décodage.
 */
export const MAX_INPUT_PIXELS = 50_000_000;

export const MIN_IMAGE_DIMENSION = 100;
export const MAX_IMAGE_DIMENSION = 10_000;

/**
 * Filtre bon marché sur le mimetype *déclaré par le client*.
 * Purement indicatif : ce champ est falsifiable, il ne prouve rien.
 * La validation qui fait autorité est le décodage Sharp (imageService).
 */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** Formats réellement reconnus par le décodeur. C'est ce filtre qui décide. */
export const ALLOWED_SHARP_FORMATS = ["jpeg", "png", "webp", "avif"] as const;

export const FULL_VARIANT = { width: 1200, height: 1200, quality: 80 } as const;
export const THUMB_VARIANT = { width: 320, height: 320, quality: 70 } as const;

export const MAX_PHOTOS_PER_BEER = 10;

/**
 * Motif des seuls chemins que l'API s'autorise à supprimer du disque.
 * Indispensable : la base contient aussi des URLs externes (https://...) issues
 * du seed. Sans ce garde-fou, un unlink sur une valeur lue en base serait une
 * primitive de suppression de fichier arbitraire.
 */
export const MANAGED_UPLOAD_PATTERN =
  /^\/uploads\/beers\/(thumbs\/)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;
