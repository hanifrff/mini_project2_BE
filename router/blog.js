const router = require("express").Router();
const blogController = require("../controller/blog");
const multerUpload = require("../middleware/multer");
const authValidator = require("../middleware/validation/auth");
const { verifyToken, isUserVerified} = require("../middleware/auth");

router.get("/", blogController.getAllBlog);
router.get("/my-blog", verifyToken, blogController.getMyBlog);
router.post(
  "/create",
  verifyToken,
  isUserVerified,
  multerUpload.single("file"),
  blogController.createBlog
);
router.get("/top", blogController.getTopLiked);
router.patch(
  "/edit-blog/:id",
  verifyToken,
  multerUpload.single("file"),
  blogController.editBlog
);

router.get("/:id", blogController.getBlogById);
router.delete("/remove/:id", verifyToken, blogController.deleteBlog);
module.exports = router;
