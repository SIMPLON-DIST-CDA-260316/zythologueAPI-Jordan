import { DatabaseError, type Pool } from "pg";
import { ConflictError } from "../errors/httpError.ts";
import { User, type UserCredentials, type UserRow } from "../models/user.ts";
import type { RegisterInput } from "../schemas/authSchema.ts";

// birthdate::text : évite le décalage de fuseau de la conversion DATE → Date
const USER_SELECT = `id, lastname, firstname, email, birthdate::text AS birthdate, role, created_at`;

export class AuthRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async addOne(
    fields: Omit<RegisterInput, "password">,
    passwordHash: string,
  ): Promise<User> {
    try {
      const newUser = await this.pool.query<UserRow>(
        `INSERT INTO "user" (lastname, firstname, email, birthdate, password) VALUES ($1, $2, $3, $4, $5) RETURNING ${USER_SELECT}`,
        [
          fields.lastName,
          fields.firstName,
          fields.email,
          fields.birthDate,
          passwordHash,
        ],
      );
      return User.fromRow(newUser.rows[0]);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ConflictError("Un compte existe déjà avec cet email");
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserCredentials | null> {
    const result = await this.pool.query<UserCredentials>(
      `SELECT id, role, password AS "passwordHash" FROM "user" WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_SELECT} FROM "user" WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? User.fromRow(row) : null;
  }
}
