const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET manquant dans l'environnement");
export const JWT_SECRET = secret;

export const JWT_EXPIRES_IN_S = 60 * 60; // 1h

export const AUTH_COOKIE_NAME = "zythologue_auth";
