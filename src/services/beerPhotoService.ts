import { MAX_PHOTOS_PER_BEER } from "../config/upload.ts";
import type { BeerPhoto } from "../models/beerPhoto.ts";
import type { BeerPhotoRepository } from "../repositories/beerPhotoRepository.ts";
import {
  generateBeerPhotoVariants,
  removeManagedFile,
  validateImage,
  type ImageValidationError,
} from "./imageService.ts";

export class BeerPhotoService {
  private readonly beerPhotoRepository: BeerPhotoRepository;

  constructor(beerPhotoRepository: BeerPhotoRepository) {
    this.beerPhotoRepository = beerPhotoRepository;
  }

  async getAllByBeerId(
    beerId: number,
  ): Promise<BeerPhoto[] | "BEER_NOT_FOUND"> {
    const beerExists = await this.beerPhotoRepository.beerExists(beerId);
    if (!beerExists) return "BEER_NOT_FOUND";
    return this.beerPhotoRepository.findAllByBeerId(beerId);
  }

  /**
   * L'ordre des étapes est un choix : on échoue au plus tôt et on n'écrit sur
   * disque qu'en dernier recours, une fois toutes les vérifications passées.
   */
  async addOne(
    beerId: number,
    buffer: Buffer,
  ): Promise<
    BeerPhoto | "BEER_NOT_FOUND" | "PHOTO_LIMIT_REACHED" | ImageValidationError
  > {
    // 1. Requête très bon marché, avant tout travail CPU de décodage.
    const beerExists = await this.beerPhotoRepository.beerExists(beerId);
    if (!beerExists) return "BEER_NOT_FOUND";

    // 2. Empêche un seul client de saturer le disque.
    const photoCount = await this.beerPhotoRepository.countByBeerId(beerId);
    if (photoCount >= MAX_PHOTOS_PER_BEER) return "PHOTO_LIMIT_REACHED";

    // 3. Le contenu est-il réellement une image ? (aucune écriture disque ici)
    const validationError = await validateImage(buffer);
    if (validationError !== null) return validationError;

    // 4. Première écriture sur disque : des octets produits par Sharp.
    const generated = await generateBeerPhotoVariants(buffer);

    // 5. Compensation : pas de fichier orphelin si l'INSERT échoue.
    try {
      return await this.beerPhotoRepository.addOne({
        beerId,
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
  async deleteOneById(
    beerId: number,
    photoId: number,
  ): Promise<true | "PHOTO_NOT_FOUND"> {
    const deleted = await this.beerPhotoRepository.deleteOneById(
      photoId,
      beerId,
    );
    if (deleted === null) return "PHOTO_NOT_FOUND";

    // removeManagedFile ignore les URLs qui ne sont pas les nôtres (seed).
    await removeManagedFile(deleted.url);
    await removeManagedFile(deleted.thumbnailUrl);
    return true;
  }
}
