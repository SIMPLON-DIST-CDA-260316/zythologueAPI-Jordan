export interface BeerReviewRow {
  id: number;
  grade: number;
  comment: string | null;
  created_at: Date;
  user_id: number;
  beer_id: number;
}

export class BeerReview {
  readonly id: number;
  readonly grade: number;
  readonly comment: string | null;
  readonly createdAt: Date;
  readonly userId: number;
  readonly beerId: number;

  constructor(
    id: number,
    grade: number,
    comment: string | null,
    createdAt: Date,
    userId: number,
    beerId: number,
  ) {
    this.id = id;
    this.grade = grade;
    this.comment = comment;
    this.createdAt = createdAt;
    this.userId = userId;
    this.beerId = beerId;
  }

  static fromRow(row: BeerReviewRow): BeerReview {
    return new BeerReview(
      row.id,
      row.grade,
      row.comment,
      row.created_at,
      row.user_id,
      row.beer_id,
    );
  }
}
