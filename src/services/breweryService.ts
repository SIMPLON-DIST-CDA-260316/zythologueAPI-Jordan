import type { Brewery } from "../models/brewery.ts";
import type { BreweryRepository } from "../repositories/breweryRepository.ts";
import type {
  CreateBreweryInput,
  GetBreweriesQuery,
  PatchBreweryInput,
} from "../schemas/brewerySchema.ts";
import { removeManagedFile } from "./imageService.ts";

export class BreweryService {
  private readonly breweryRepository: BreweryRepository;

  constructor(breweryRepository: BreweryRepository) {
    this.breweryRepository = breweryRepository;
  }

  async getAll(query: GetBreweriesQuery): Promise<{
    data: Brewery[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const { breweries, total } = await this.breweryRepository.findAll(query);
    return {
      data: breweries,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getOneById(breweryId: number): Promise<Brewery | null> {
    return this.breweryRepository.findOneById(breweryId);
  }

  /**
   * Supprime la brasserie et, par cascade SQL, ses bières, photos, avis et
   * favoris. Les fichiers image ne sont pas concernés par la cascade : on relève
   * leurs chemins avant, puis on les efface une fois la ligne partie — dans cet
   * ordre, un échec disque ne laisse jamais une ligne pointant vers un fichier
   * absent.
   */
  async deleteOneById(breweryId: number): Promise<boolean> {
    const photoUrls =
      await this.breweryRepository.findPhotoUrlsByBreweryId(breweryId);

    const deleted = await this.breweryRepository.deleteOneById(breweryId);
    if (!deleted) return false;

    // removeManagedFile ignore les URLs qui ne sont pas les nôtres (seed).
    for (const photo of photoUrls) {
      await removeManagedFile(photo.url);
      await removeManagedFile(photo.thumbnailUrl);
    }
    return true;
  }

  async addOne(
    breweryInput: CreateBreweryInput,
  ): Promise<Brewery | "NAME_ALREADY_EXISTS"> {
    const breweryNameExists = await this.breweryRepository.breweryNameExists(
      breweryInput.name,
    );
    if (breweryNameExists) return "NAME_ALREADY_EXISTS";
    return this.breweryRepository.addOne(breweryInput);
  }

  async updateOneById(
    breweryId: number,
    patch: PatchBreweryInput,
  ): Promise<Brewery | "BREWERY_NOT_FOUND" | "NAME_ALREADY_EXISTS"> {
    const currentBrewery = await this.breweryRepository.findOneById(breweryId);
    if (!currentBrewery) return "BREWERY_NOT_FOUND";

    if (patch.name !== undefined && patch.name !== currentBrewery.name) {
      const nameExists = await this.breweryRepository.breweryNameExists(
        patch.name,
        breweryId,
      );
      if (nameExists) return "NAME_ALREADY_EXISTS";
    }

    const mergedFields = {
      name: patch.name ?? currentBrewery.name,
      description: patch.description ?? currentBrewery.description,
      country: patch.country ?? currentBrewery.country,
      city: patch.city ?? currentBrewery.city,
      // website est nullable : on teste !== undefined pour qu'un null explicite
      // puisse effacer la valeur.
      website:
        patch.website !== undefined ? patch.website : currentBrewery.website,
    };

    const updatedBrewery = await this.breweryRepository.updateOneById(
      breweryId,
      mergedFields,
    );
    if (!updatedBrewery) {
      throw new Error("Erreur lors de la mise à jour de la brasserie");
    }
    return updatedBrewery;
  }
}
