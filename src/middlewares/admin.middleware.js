import { allStatusCode } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = req?.user;

    if (user?.role != 'admin') {
      return res
        .status(allStatusCode.unauthorized)
        .json(
          new ApiError(allStatusCode.unauthorized, "Unauthorized admin access.")
        );
    }

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(allStatusCode.unauthorized)
      .json(
        new ApiError(
          allStatusCode.unauthorized,
          error?.message || "Invalid access token"
        )
      );
  }
});
