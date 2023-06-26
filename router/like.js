const router = require("express").Router();
const likeController = require("../controller/like");
const multerUpload = require("../middleware/multer");
const { verifyToken } = require("../middleware/auth");

router.post("/like/:id", verifyToken, likeController.like);
router.post("/unlike/:id", verifyToken, likeController.unlike);
router.get("/liked", verifyToken, likeController.getLikedBlog);

module.exports = router;
