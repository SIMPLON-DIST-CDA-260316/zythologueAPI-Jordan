/**
 * Erreur portant elle-même son status HTTP. N'importe quelle couche (service,
 * repository) peut la lever sans connaître Express — elle ne connaît que le
 * vocabulaire métier ("pas trouvé", "conflit"). C'est errorHandler qui sait
 * traduire ça en réponse HTTP.
 */
export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = new.target.name; // "NotFoundError", "ConflictError", etc.
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Ressource non trouvée") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message: string) {
    super(413, message);
  }
}

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message: string) {
    super(415, message);
  }
}
