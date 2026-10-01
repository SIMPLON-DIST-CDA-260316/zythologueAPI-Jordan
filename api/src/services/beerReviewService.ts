import { ForbiddenError, NotFoundError } from "../errors/httpError.ts";
import type { BeerReview } from "../models/beerReview.ts";
import type { User } from "../models/user.ts";
import type { BeerReviewRepository } from "../repositories/beerReviewRepository.ts";
import type {
  CreateBeerReviewInput,
  PatchBeerReviewInput,
} from "../schemas/beerReviewSchema.ts";

export class BeerReviewService {
  private readonly beerReviewRepository: BeerReviewRepository;

  constructor(beerReviewRepository: BeerReviewRepository) {
    this.beerReviewRepository = beerReviewRepository;
  }

  async getAllByBeerId(beerId: number): Promise<BeerReview[]> {
    const beerExists = await this.beerReviewRepository.beerExists(beerId);
    if (!beerExists) throw new NotFoundError("Bière non trouvée");
    return this.beerReviewRepository.findAllByBeerId(beerId);
  }

  async addOne(
    beerId: number,
    user: User,
    input: CreateBeerReviewInput,
  ): Promise<BeerReview> {
    const beerExists = await this.beerReviewRepository.beerExists(beerId);
    if (!beerExists) throw new NotFoundError("Bière non trouvée");
    return this.beerReviewRepository.addOne(beerId, user.id, {
      grade: input.grade,
      comment: input.comment ?? null,
    });
  }

  async updateOneById(
    beerId: number,
    reviewId: number,
    user: User,
    input: PatchBeerReviewInput,
  ): Promise<BeerReview> {
    const review = await this.beerReviewRepository.findOneById(
      reviewId,
      beerId,
    );
    if (!review) throw new NotFoundError("Avis non trouvé");

    // Seul l'auteur modifie son avis, même un admin ne réécrit pas les mots d'un autre
    if (review.userId !== user.id) {
      throw new ForbiddenError("Vous ne pouvez modifier que vos propres avis");
    }

    return this.beerReviewRepository.updateOneById(reviewId, {
      grade: input.grade ?? review.grade,
      // !== undefined et pas ?? : un null envoyé exprès doit effacer le commentaire
      comment: input.comment !== undefined ? input.comment : review.comment,
    });
  }

  async deleteOneById(
    beerId: number,
    reviewId: number,
    user: User,
  ): Promise<void> {
    const review = await this.beerReviewRepository.findOneById(
      reviewId,
      beerId,
    );
    if (!review) throw new NotFoundError("Avis non trouvé");
    // Suppression : l'auteur, ou un admin (modération)
    if (review.userId !== user.id && user.role !== "admin") {
      throw new ForbiddenError("Vous ne pouvez supprimer que vos propres avis");
    }
    await this.beerReviewRepository.deleteOneById(reviewId);
  }
}
