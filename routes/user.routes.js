import { Router } from "express";
import {
  getCurrentUser,
  registerUser,
  sendAccessToken,
  updateAvatar,
  updateEmail,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/jwt").post(sendAccessToken);
router.route("/user-details").get(verifyJwt, getCurrentUser);
router.route("/user-details").put(verifyJwt, updateUserDetails);
router.route("/update-email").put(verifyJwt, updateEmail);
router.route("/avatar").put(verifyJwt, upload.single("avatar"), updateAvatar);

export default router;
