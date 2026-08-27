import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../config/upload.ts";

/**
 * Multer reçoit le multipart/form-data et rien de plus : il ne valide pas le
 * contenu du fichier. Sa responsabilité ici est de borner ce qui entre.
 *
 * memoryStorage plutôt que diskStorage : les octets envoyés par le client ne
 * doivent jamais toucher le disque tant que Sharp ne les a pas décodés. Le coût
 * est une consommation RAM, bornée par la limite fileSize ci-dessous.
 */
const singleUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // défaut : Infinity
    files: 1,
    fields: 0, // aucun champ texte attendu sur cette route
    // 2 et non 1 : busboy compte une part supplémentaire pour la clôture du
    // multipart, donc « parts: 1 » rejetterait déjà un upload d'un seul fichier.
    parts: 2,
    fieldNameSize: 100,
    headerPairs: 20, // défaut : 2000
  },
  fileFilter: (_req, file, callback) => {
    // Pré-filtre de confort sur le mimetype ANNONCÉ par le client.
    // Il n'apporte aucune garantie : un exécutable envoyé avec
    // « type=image/jpeg » passe ici. C'est Sharp qui tranche ensuite.
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      callback(new Error("Format de fichier non supporté (JPEG, PNG, WebP ou AVIF attendu)"));
      return;
    }
    callback(null, true);
  },
  // file.originalname n'est utilisé nulle part : ni pour nommer le fichier, ni
  // pour construire un chemin. preservePath reste à false (défaut) pour ne pas
  // récupérer les segments de chemin fournis par le client.
}).single("photo");

const mapMulterError = (
  err: multer.MulterError,
): { status: number; message: string } => {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return { status: 413, message: "Fichier trop volumineux (5 Mo maximum)" };
    case "LIMIT_FILE_COUNT":
    case "LIMIT_PART_COUNT":
      return { status: 400, message: "Un seul fichier est accepté" };
    case "LIMIT_UNEXPECTED_FILE":
      return {
        status: 400,
        message: "Champ de fichier inattendu (champ attendu : « photo »)",
      };
    default:
      // Volontairement générique : err.message peut exposer des détails internes.
      return { status: 400, message: "Requête multipart invalide" };
  }
};

/**
 * Le projet n'a pas d'error handler global : une MulterError non interceptée
 * partirait dans le handler par défaut d'Express et renverrait du HTML avec une
 * stack trace. On appelle donc Multer à la main (pattern documenté dans son
 * README) pour rester au format { message } utilisé par validate.ts.
 */
export const uploadBeerPhoto = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  singleUpload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const { status, message } = mapMulterError(err);
      res.status(status).json({ message });
      return;
    }
    if (err) {
      // Seule erreur non-Multer possible ici : le rejet du fileFilter ci-dessus,
      // dont le message est écrit par nous.
      res.status(415).json({ message: (err as Error).message });
      return;
    }
    if (!req.file) {
      res
        .status(400)
        .json({ message: "Aucun fichier reçu (champ attendu : « photo »)" });
      return;
    }
    next();
  });
};
