const authController = require("../controller/auth");

const router = require("express").Router();
router.post("/", authController.register);

module.exports = router;
