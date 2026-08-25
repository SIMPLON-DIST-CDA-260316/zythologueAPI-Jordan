export interface BeerLogRow {
  id: number;
  beer_id: number;
  beer_name: string;
  action: string;
  logged_at: Date;
  logged_by: string;
}

export class BeerLog {
  readonly id: number;
  readonly beerId: number;
  readonly beerName: string;
  readonly action: string;
  readonly loggedAt: Date;
  readonly loggedBy: string;

  constructor(
    id: number,
    beerId: number,
    beerName: string,
    action: string,
    loggedAt: Date,
    loggedBy: string,
  ) {
    this.id = id;
    this.beerId = beerId;
    this.beerName = beerName;
    this.action = action;
    this.loggedAt = loggedAt;
    this.loggedBy = loggedBy;
  }

  static fromRow(row: BeerLogRow): BeerLog {
    return new BeerLog(
      row.id,
      row.beer_id,
      row.beer_name,
      row.action,
      row.logged_at,
      row.logged_by,
    );
  }
}
