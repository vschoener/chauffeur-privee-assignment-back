// @flow
export class MessageError extends Error {
  requeue: boolean;
  logLevel: string;

  constructor(message: any) {
    super(message);

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }

    this.logLevel = 'error';
    this.requeue = false;
  }

  /**
   * Return MessageError with requeue enabled
   * @param message
   * @param logLevel
   */
  static getRequeueError(message: string, logLevel: string): MessageError {
    const error = new MessageError(message);
    error.requeue = true;
    error.logLevel = logLevel;

    return error;
  }
}
