const router = require("express").Router();
const profileController = require("../controller/profile");
const authMiddleware = require("../middleware/auth");
const authValidator = require("../middleware/validation/auth");
const multerUpload = require("../middleware/multer");
const { verifyToken } = require("../middleware/auth");

router.use(authMiddleware.verifyToken);

router.get("/", profileController.getLoggedInProfile);
router.patch(
  "/update",
  verifyToken,
  authValidator.validateUpdate,
  profileController.updateProfile
);
router.patch(
  "/change-password",
  verifyToken,
  // authValidator.validateChangePass,
  profileController.changePassword
);
router.post(
  "/profile-picture",
  verifyToken,
  multerUpload.single("file"),
  profileController.updateProfilePicture
);
router.delete("/close-account/:id", verifyToken, profileController.closeAccount);

module.exports = router;
