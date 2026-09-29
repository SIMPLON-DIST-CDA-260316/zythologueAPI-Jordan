export interface UserRow {
  id: number;
  lastname: string;
  firstname: string;
  email: string;
  birthdate: string;
  role: "client" | "admin";
  created_at: Date;
}

export class User {
  readonly id: number;
  readonly lastName: string;
  readonly firstName: string;
  readonly email: string;
  readonly birthDate: string;
  readonly role: "client" | "admin";
  readonly createdAt: Date;

  constructor(
    id: number,
    lastName: string,
    firstName: string,
    email: string,
    birthDate: string,
    role: "client" | "admin",
    createdAt: Date,
  ) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.email = email;
    this.birthDate = birthDate;
    this.role = role;
    this.createdAt = createdAt;
  }

  static fromRow(row: UserRow): User {
    return new User(
      row.id,
      row.lastname,
      row.firstname,
      row.email,
      row.birthdate,
      row.role,
      row.created_at,
    );
  }
}
