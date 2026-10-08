export class HttpError extends Error {
  public status: number;
  public details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (message: string, details?: any) => new HttpError(400, message, details);
export const unauthorized = (message = "Unauthorized") => new HttpError(401, message);
export const forbidden = (message = "Forbidden") => new HttpError(403, message);
export const notFound = (message = "Not Found") => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);