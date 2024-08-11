import { allStatusCode } from "../constants.js";

class APIResponse {
  constructor(statusCode, data = [], message = "Successfully work") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < allStatusCode.clientError;
  }
}

export { APIResponse };
