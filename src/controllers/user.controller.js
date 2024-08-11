import { allStatusCode } from "../constants.js";
import { User } from "../models/User.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, gender } = req.body;

  if (
    [firstName, lastName, email, gender].some(
      (field) => field === undefined || field.trim() === ""
    )
  ) {
    return res
      .status(allStatusCode.clientError)
      .json(
        new ApiError(
          allStatusCode.clientError,
          "Please fill the required fields"
        )
      );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res
      .status(allStatusCode.clientError)
      .json(
        new ApiError(allStatusCode.clientError, "Please enter proper email.")
      );
  }

  const existedUserEmail = await User.findOne({ email: email });
  if (existedUserEmail) {
    return res
      .status(allStatusCode.userExist)
      .json(
        new ApiError(allStatusCode.userExist, "User email already exists.")
      );
  }

  const user = await User.create({
    firstName,
    lastName,
    email: email?.toLowerCase(),
    gender,
  });

  const createdUser = await User.findById(user?._id);

  if (!createdUser) {
    return res
      .status(allStatusCode.somethingWrong)
      .json(
        new ApiError(
          allStatusCode.somethingWrong,
          "Somethings went wrong! while registering the user."
        )
      );
  }
  console.log("user create successfully");
  return res
    .status(allStatusCode.success)
    .json(
      new APIResponse(
        allStatusCode.success,
        createdUser,
        "User register successfully"
      )
    );
});

const sendAccessToken = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(allStatusCode.unauthorized)
      .json(new ApiError(allStatusCode.unauthorized, "Invalid user"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(allStatusCode.unauthorized)
      .json(new ApiError(allStatusCode.unauthorized, "User not authorized!"));
  }

  const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(allStatusCode.success)
    .cookie("accessToken", token, options)
    .json(
      new APIResponse(
        allStatusCode.success,
        { token },
        "JWT token send successfully"
      )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(allStatusCode.success)
    .json(
      new APIResponse(
        allStatusCode.success,
        req.user,
        "current user fetched successfully"
      )
    );
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  if (
    [firstName, lastName].some(
      (field) => field === undefined || field.trim() === ""
    )
  ) {
    return res
      .status(allStatusCode.clientError)
      .json(
        new ApiError(
          allStatusCode.clientError,
          "Please fill the required fields"
        )
      );
  }

  const user = req.user;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          firstName,
          lastName,
        },
      },
      { new: true }
    );

    return res
      .status(allStatusCode.success)
      .json(
        new APIResponse(
          allStatusCode.success,
          updatedUser,
          "Account details updated successfully."
        )
      );
  } catch (error) {
    console.error("Error updating user details:", error);
    return res
      .status(allStatusCode.somethingWrong)
      .json(
        new ApiError(allStatusCode.somethingWrong, "Internal Server Error")
      );
  }
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(allStatusCode.clientError)
      .json(new ApiError(allStatusCode.clientError, "Please enter the email."));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res
      .status(allStatusCode.clientError)
      .json(
        new ApiError(allStatusCode.clientError, "Please enter proper email.")
      );
  }

  const user = req?.user;

  if (email === user?.email) {
    return res
      .status(allStatusCode.clientError)
      .json(
        new ApiError(allStatusCode.clientError, "This is your previous email.")
      );
  }

  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    return res
      .status(allStatusCode.clientError)
      .json(
        new ApiError(
          allStatusCode.clientError,
          "This email already have an account."
        )
      );
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          email: email.toLowerCase(),
        },
      },
      { new: true }
    );

    return res
      .status(allStatusCode.success)
      .json(
        new APIResponse(
          allStatusCode.success,
          updatedUser,
          "Email updated successfully."
        )
      );
  } catch (error) {
    console.error("Error updating email in database:", error);
    return res
      .status(allStatusCode.somethingWrong)
      .json(
        new ApiError(allStatusCode.somethingWrong, "Internal Server Error")
      );
  }
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    return res.status(400).json(new ApiError(400, "Avatar file is missing"));
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    return res
      .status(400)
      .json(new ApiError(400, "Error while uploading on avatar"));
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new APIResponse(200, user, "Avatar update successfully."));
});

export {
  registerUser,
  sendAccessToken,
  getCurrentUser,
  updateUserDetails,
  updateEmail,
  updateAvatar,
};
