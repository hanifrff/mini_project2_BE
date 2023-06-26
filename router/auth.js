const authController = require("../controller/auth");
const authValidator = require("../middleware/validation/auth");
const router = require("express").Router();

router.post("/register", authValidator.validateRegister, authController.register);
router.post("/reset", authValidator.validateResetPass, authController.reset);
router.post("/forgot", authController.forgot);
// router.get("/", authController.keepLogin);
router.patch("/verify", authController.verify);
router.post("/login", authController.login);


module.exports = router;
