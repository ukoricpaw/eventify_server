class ApiError extends Error {
  public status: number;
  public message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }

  static BadRequest(message: string) {
    throw new ApiError(400, message);
  }

  static NoAccess(message: string) {
    throw new ApiError(403, message);
  }

  static NotAuthorized(message: string) {
    throw new ApiError(401, message);
  }
}

export default ApiError;
