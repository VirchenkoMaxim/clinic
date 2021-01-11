export class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}
export class ValidationError extends Error {
  constructor(error) {
    super();
    this.errors = error.errors;
    this.message = error.message;
    this.status = 'ValidationError';
  }

  get statusCode() {
    return 422;
  }
}
export class NotModifiedError extends Error {
  get statusCode() {
    return 304;
  }
}

export class BadRequestError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.status = 'BadRequestError';
  }

  get statusCode() {
    return 400;
  }
}

export const handleError = (err, res) => {
  switch (true) {
    case err instanceof ErrorHandler: {
      const { statusCode, message } = err;
      res.status(statusCode).send({
        status: 'error',
        statusCode,
        message,
      });
      break;
    }
    case err instanceof ValidationError: {
      const { statusCode, message, status, errors } = err;
      res.status(statusCode).send({
        status,
        statusCode,
        message,
        errors,
      });
      break;
    }
    case err instanceof BadRequestError: {
      const { statusCode, message, status } = err;
      res.status(statusCode).send({
        status,
        statusCode,
        message,
      });
      break;
    }
    case err instanceof NotModifiedError: {
      const { statusCode } = err;
      res.status(statusCode).send();
      break;
    }
    default: {
      const { message } = err;
      res.status(500).send({
        status: 'Error',
        message,
      });
      break;
    }
  }
};
