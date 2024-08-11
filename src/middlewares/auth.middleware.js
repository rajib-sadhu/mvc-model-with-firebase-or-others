import { allStatusCode } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.models.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(allStatusCode.unauthorized)
        .json(new ApiError(allStatusCode.unauthorized, "Unauthorized request"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.find({ email: decodedToken?.email });

    if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) {
      // TODO discuss about frontend
      return res
        .status(allStatusCode.unauthorized)
        .json(
          new ApiError(allStatusCode.unauthorized, "Invalid access token.")
        );
    }
    

    req.user = user[0];
    next();
  } catch (error) {
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
