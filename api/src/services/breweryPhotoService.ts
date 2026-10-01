import {
  BREWERY_PHOTO_TARGET,
  MAX_PHOTOS_PER_BREWERY,
} from "../config/upload.ts";
import { ConflictError, NotFoundError } from "../errors/httpError.ts";
import type { BreweryPhoto } from "../models/breweryPhoto.ts";
import type { BreweryPhotoRepository } from "../repositories/breweryPhotoRepository.ts";
import {
  generatePhotoVariants,
  removeManagedFile,
  throwOnImageValidationError,
  validateImage,
} from "./imageService.ts";

export class BreweryPhotoService {
  private readonly breweryPhotoRepository: BreweryPhotoRepository;

  constructor(breweryPhotoRepository: BreweryPhotoRepository) {
    this.breweryPhotoRepository = breweryPhotoRepository;
  }

  async getAllByBreweryId(breweryId: number): Promise<BreweryPhoto[]> {
    const breweryExists =
      await this.breweryPhotoRepository.breweryExists(breweryId);
    if (!breweryExists) throw new NotFoundError("Brasserie non trouvée");
    return this.breweryPhotoRepository.findAllByBreweryId(breweryId);
  }

  /**
   * L'ordre des étapes est un choix : on échoue au plus tôt et on n'écrit sur
   * disque qu'en dernier recours, une fois toutes les vérifications passées.
   */
  async addOne(breweryId: number, buffer: Buffer): Promise<BreweryPhoto> {
    // 1. Requête très bon marché, avant tout travail CPU de décodage.
    const breweryExists =
      await this.breweryPhotoRepository.breweryExists(breweryId);
    if (!breweryExists) throw new NotFoundError("Brasserie non trouvée");

    // 2. Empêche un seul client de saturer le disque.
    const photoCount =
      await this.breweryPhotoRepository.countByBreweryId(breweryId);
    if (photoCount >= MAX_PHOTOS_PER_BREWERY) {
      throw new ConflictError(
        "Cette brasserie a déjà le nombre maximum de photos",
      );
    }

    // 3. Le contenu est-il réellement une image ? (aucune écriture disque ici)
    const validationError = await validateImage(buffer);
    throwOnImageValidationError(validationError);

    // 4. Première écriture sur disque : des octets produits par Sharp.
    const generated = await generatePhotoVariants(
      buffer,
      BREWERY_PHOTO_TARGET,
    );

    // 5. Compensation : pas de fichier orphelin si l'INSERT échoue.
    try {
      return await this.breweryPhotoRepository.addOne({
        breweryId,
        url: generated.url,
        thumbnailUrl: generated.thumbnailUrl,
        width: generated.width,
        height: generated.height,
      });
    } catch (err) {
      await removeManagedFile(generated.url);
      await removeManagedFile(generated.thumbnailUrl);
      throw err;
    }
  }

  /**
   * La ligne part d'abord, les fichiers ensuite : dans cet ordre, un échec disque
   * ne laisse jamais une ligne pointant vers un fichier absent.
   */
  async deleteOneById(breweryId: number, photoId: number): Promise<void> {
    const deleted = await this.breweryPhotoRepository.deleteOneById(
      photoId,
      breweryId,
    );
    if (deleted === null) throw new NotFoundError("Photo non trouvée");

    // removeManagedFile ignore les URLs qui ne sont pas les nôtres (seed).
    await removeManagedFile(deleted.url);
    await removeManagedFile(deleted.thumbnailUrl);
  }
}
