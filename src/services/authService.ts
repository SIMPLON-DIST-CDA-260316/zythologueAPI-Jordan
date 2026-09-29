import { hash } from "argon2";
import type { User } from "../models/user.ts";
import type { AuthRepository } from "../repositories/authRepository.ts";
import type { RegisterInput } from "../schemas/authSchema.ts";

export class AuthService {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async register({ password, ...fields }: RegisterInput): Promise<User> {
    const hashedPassword = await hash(password);
    return this.authRepository.addOne(fields, hashedPassword);
  }
}
