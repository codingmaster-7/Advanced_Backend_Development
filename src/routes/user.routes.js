import { Router } from "express";
import { 
    registerUser ,
     loginUser,
      logoutUser ,
      refreshAccessToken,
      changePassword,
      updateUser,
      changeAvatar
    } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import jwtVerify from "../middlewares/auth.middlewares.js";
const router=Router();

router.route("/register").post(upload.fields(
    [
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }

    ]
),registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(jwtVerify,logoutUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/changePassword").patch(jwtVerify,changePassword);
router.route("/updateUser").patch(jwtVerify,updateUser);
router.route("/changeAvatar").patch(jwtVerify,upload.single("avatar"),changeAvatar);
export default router;