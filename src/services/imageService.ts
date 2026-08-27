import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import {
  ALLOWED_SHARP_FORMATS,
  FULL_VARIANT,
  MANAGED_UPLOAD_PATTERN,
  MAX_IMAGE_DIMENSION,
  MAX_INPUT_PIXELS,
  MIN_IMAGE_DIMENSION,
  PHOTO_TARGETS,
  THUMB_VARIANT,
  UPLOADS_PUBLIC_PATH,
  UPLOADS_ROOT,
  type PhotoTarget,
} from "../config/upload.ts";

export type ImageValidationError =
  | "NOT_AN_IMAGE"
  | "UNSUPPORTED_FORMAT"
  | "IMAGE_TOO_SMALL"
  | "IMAGE_TOO_LARGE";

export interface GeneratedImage {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

/**
 * Options appliquées à CHAQUE lecture d'octets non fiables.
 * failOn: "warning" refuse les fichiers malformés au lieu de tenter de les
 * réparer ; limitInputPixels borne le décodage avant qu'il n'ait lieu.
 */
const sharpOptions = {
  failOn: "warning",
  limitInputPixels: MAX_INPUT_PIXELS,
  animated: false, // une seule frame : pas de WebP/GIF animé à 500 images
  sequentialRead: true,
  autoOrient: true, // applique l'orientation EXIF avant le redimensionnement
} as const;

/**
 * Le test qui démasque un exécutable renommé en .jpg : si libvips ne sait pas
 * décoder les octets, ce n'est pas une image, quels que soient son nom et le
 * mimetype annoncé par le client.
 */
export const validateImage = async (
  buffer: Buffer,
): Promise<ImageValidationError | null> => {
  let metadata: Metadata;
  try {
    metadata = await sharp(buffer, sharpOptions).metadata();
  } catch {
    return "NOT_AN_IMAGE";
  }

  const { format, width, height } = metadata;

  if (format === undefined || width === undefined || height === undefined) {
    return "NOT_AN_IMAGE";
  }
  if (!ALLOWED_SHARP_FORMATS.includes(format as (typeof ALLOWED_SHARP_FORMATS)[number])) {
    return "UNSUPPORTED_FORMAT";
  }
  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    return "IMAGE_TOO_SMALL";
  }
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    return "IMAGE_TOO_LARGE";
  }
  return null;
};

/** Assertion défensive : aucune donnée client n'entre dans ces chemins, mais on vérifie. */
const assertInsideUploads = (filePath: string): void => {
  const resolved = path.resolve(filePath);
  if (resolved !== UPLOADS_ROOT && !resolved.startsWith(UPLOADS_ROOT + path.sep)) {
    throw new Error("Chemin de destination hors du répertoire d'uploads");
  }
};

/**
 * Produit les deux variantes WebP. Les octets écrits sur disque sont ceux
 * générés par Sharp, jamais ceux reçus du client : un polyglotte, un payload
 * caché dans un segment EXIF ou un script concaténé ne survit pas au
 * ré-encodage.
 *
 * Aucun keepMetadata() / withMetadata() / keepExif() : Sharp supprime les
 * métadonnées par défaut, ce qui efface au passage les coordonnées GPS.
 */
export const generatePhotoVariants = async (
  buffer: Buffer,
  target: PhotoTarget,
): Promise<GeneratedImage> => {
  // Nom généré côté serveur : file.originalname n'est jamais utilisé.
  const filename = `${randomUUID()}.webp`;
  const fullPath = path.join(target.dir, filename);
  const thumbPath = path.join(target.thumbsDir, filename);
  assertInsideUploads(fullPath);
  assertInsideUploads(thumbPath);

  const fullInfo = await sharp(buffer, sharpOptions)
    .resize({
      width: FULL_VARIANT.width,
      height: FULL_VARIANT.height,
      fit: "inside",
      withoutEnlargement: true, // on ne fabrique pas de pixels
    })
    .webp({ quality: FULL_VARIANT.quality, effort: 4 })
    .toFile(fullPath);

  try {
    await sharp(buffer, sharpOptions)
      .resize({
        width: THUMB_VARIANT.width,
        height: THUMB_VARIANT.height,
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: THUMB_VARIANT.quality, effort: 4 })
      .toFile(thumbPath);
  } catch (err) {
    // Pas de fichier orphelin si la seconde variante échoue.
    await fs.unlink(fullPath).catch(() => undefined);
    throw err;
  }

  return {
    url: `${target.publicPath}/${filename}`,
    thumbnailUrl: `${target.thumbsPublicPath}/${filename}`,
    // Dimensions de l'image FINALE, obtenues gratuitement via l'objet info.
    width: fullInfo.width,
    height: fullInfo.height,
  };
};

/**
 * Supprime un fichier du disque UNIQUEMENT si son URL est une URL que nous avons
 * nous-mêmes générée. Une valeur lue en base peut être une URL externe
 * (https://images.example.com/...) : elle ne doit déclencher aucun unlink.
 */
export const removeManagedFile = async (url: string | null): Promise<void> => {
  if (url === null || !MANAGED_UPLOAD_PATTERN.test(url)) return;

  const relativePath = url.slice(UPLOADS_PUBLIC_PATH.length + 1);
  const filePath = path.join(UPLOADS_ROOT, relativePath);
  assertInsideUploads(filePath);

  try {
    await fs.unlink(filePath);
  } catch (err) {
    // Fichier déjà absent : la suppression a atteint son but.
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
};

/** Crée l'arborescence d'uploads au démarrage (recursive : crée aussi les parents). */
export const ensureUploadDirectories = async (): Promise<void> => {
  await Promise.all(
    PHOTO_TARGETS.map((target) =>
      fs.mkdir(target.thumbsDir, { recursive: true }),
    ),
  );
};
