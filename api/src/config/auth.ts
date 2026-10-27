const secret = process.env.JWT_SECRET;
// 32 caractères minimum : refuse aussi la valeur d'exemple publique de .env.sample
if (!secret || secret.length < 32) {
  throw new Error("JWT_SECRET manquant ou trop court (32 caractères minimum)");
}
export const JWT_SECRET = secret;

export const JWT_EXPIRES_IN_S = 60 * 60; // 1h

export const AUTH_COOKIE_NAME = "zythologue_auth";
