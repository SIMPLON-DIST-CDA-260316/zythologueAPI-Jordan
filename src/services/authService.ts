import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN_S, JWT_SECRET } from "../config/auth.ts";
import { BadRequestError } from "../errors/httpError.ts";
import type { User } from "../models/user.ts";
import type { AuthRepository } from "../repositories/authRepository.ts";
import type { LoginInput, RegisterInput } from "../schemas/authSchema.ts";

const INVALID_CREDENTIALS = "Email ou mot de passe incorrect";
const DUMMY_HASH = await hash("dummy-password-for-timing");

export class AuthService {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async register({ password, ...fields }: RegisterInput): Promise<User> {
    const hashedPassword = await hash(password);
    return this.authRepository.addOne(fields, hashedPassword);
  }

  async login({ email, password }: LoginInput): Promise<string> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      // Protection attaque temporelle : la requête prend autant de temps
      // qu'un compte existe pour l'email ou non
      await verify(DUMMY_HASH, password);
      throw new BadRequestError(INVALID_CREDENTIALS);
    }

    const isValid = await verify(user.passwordHash, password);
    if (!isValid) {
      throw new BadRequestError(INVALID_CREDENTIALS);
    }

    return jwt.sign({ role: user.role }, JWT_SECRET, {
      subject: String(user.id),
      expiresIn: JWT_EXPIRES_IN_S,
      algorithm: "HS256",
    });
  }
}
