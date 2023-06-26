const db = require("../models");

const {
  setFromFileNameToDBValue,
  getFilenameFromDbValue,
  getAbsolutePathPublicFile,
} = require("../utils/file");
const fs = require("fs");

module.exports = {
  async getAllBlog(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 10,
      search: req.query.search || undefined,
      sortBy: req.query.sort || "createdAt",
      sortOrder: req.query.order || "desc",
      category: req.query.category || undefined,
      keywords: req.query.keywords || undefined,
      title: req.query.title || undefined,
    };

    try {
      let where = {};

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          {
            "$user.username$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
          { keywords: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          { title: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          { content: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
        ];
      }

      if (pagination.category) {
        where.category = pagination.category;
      }

      if (pagination.keywords) {
        where.keywords = { [db.Sequelize.Op.like]: `%${pagination.keywords}%` };
      }

      if (pagination.title) {
        where.title = { [db.Sequelize.Op.like]: `%${pagination.title}%` };
      }

      const { count, rows } = await db.Blog.findAndCountAll({
        where,
        include: [{ model: db.user, attributes: ["username"], as: "user" }],
        order: [[pagination.sortBy, pagination.sortOrder]],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      if (pagination.search && count === 0) {
        return res.status(404).send({
          message: "No blogs found matching the search query.",
        });
      }

      const totalPages = Math.ceil(count / pagination.perPage);

      res.send({
        message: "Successfully retrieved blogs.",
        pagination: {
          page: pagination.page,
          perPage: pagination.perPage,
          totalPages: totalPages,
          totalData: count,
        },
        data: rows,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({
        message: "An error occurred while processing the request.",
        error: error.message,
      });
    }
  },

  async getBlogById(req, res) {
    const { id } = req.params;
    try {
      const results = await db.Blog.findOne({
        where: {
          id,
        },
      });
      res.send({
        message: "success get blog from profile",
        data: results,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error on server",
        errors: error.message,
      });
    }
  },
  async createBlog(req, res) {
    const { title, category, content, videoURL, keywords, country } = req.body;
    const imageURL = setFromFileNameToDBValue(req.file.filename);
    const userID = req.user.id;
    try {
      const newBlog = await db.Blog.create({
        title,
        authorID: userID,
        imgURL: imageURL,
        category,
        content,
        videoURL,
        keywords,
        country,
      });
      res.status(200).send({
        message: "blog successfully posted",
        data: newBlog,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error",
        error: error.message,
      });
    }
  },
  async editBlog(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, category, content, videoURL, keywords, country } = req.body;

    try {
      const blog = await db.Blog.findOne({ where: { id, authorID: userId } });

      if (!blog) {
        return res.status(404).send({
          message: "Blog not found or you do not have permission to edit it.",
        });
      }

      // Ensure that the logged-in user owns the blog
      if (blog.authorID !== userId) {
        return res.status(403).send({
          message: "You are not authorized to edit this blog.",
        });
      }

      // Perform any additional checks or validations if necessary

      // Update the blog with the new data
      blog.title = title;
      blog.category = category;
      blog.content = content;
      blog.videoURL = videoURL;
      blog.keywords = keywords;
      blog.country = country;

      await blog.save();

      res.send({
        message: "Blog successfully updated.",
        data: blog,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({
        message: "An error occurred while updating the blog.",
        error: error.message,
      });
    }
  },
  async getMyBlog(req, res) {
    const authorID = req.user.id;
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 10,
      search: req.query.search || undefined,
      sortBy: req.query.sort || "createdAt",
      sortOrder: req.query.order || "desc",
      category: req.query.category || undefined,
      keywords: req.query.keywords || undefined,
      title: req.query.title || undefined,
    };

    try {
      let where = { authorID };

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          {
            "$user.username$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
          { keywords: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          { title: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          { content: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
        ];
      }

      if (pagination.category) {
        where.category = pagination.category;
      }

      if (pagination.keywords) {
        where.keywords = { [db.Sequelize.Op.like]: `%${pagination.keywords}%` };
      }

      if (pagination.title) {
        where.title = { [db.Sequelize.Op.like]: `%${pagination.title}%` };
      }

      const { count, rows } = await db.Blog.findAndCountAll({
        where,
        include: [{ model: db.user, attributes: ["username"], as: "user" }],
        order: [[pagination.sortBy, pagination.sortOrder]],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      if (pagination.search && count === 0) {
        return res.status(404).send({
          message: "No blogs found matching the search query.",
        });
      }

      const totalPages = Math.ceil(count / pagination.perPage);

      res.send({
        message: "Successfully retrieved blogs.",
        pagination: {
          page: pagination.page,
          perPage: pagination.perPage,
          totalPages: totalPages,
          totalData: count,
        },
        data: rows,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({
        message: "An error occurred while processing the request.",
        error: error.message,
      });
    }
  },
  async getTopLiked(req, res) {
    try {
      const mostLike = await db.like.findAll({
        attributes: [
          "blogID",
          [db.Sequelize.fn("COUNT", db.Sequelize.col("blogID")), "likeCount"],
        ],
        include: [
          {
            model: db.Blog,
            attributes: ["id", "title", "category"],
            as: "Blog",
            include: [
              {
                model: db.user,
                attributes: ["id"],
              },
            ],
          },
        ],
        group: ["blogID"],
        order: [[db.Sequelize.literal("likeCount"), "DESC"]],
        limit: 10,
      });

      res.status(201).send({
        message: "most favorite blog displayed",
        data: mostLike,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error on server",
        errors: error.message,
      });
    }
  },
  async deleteBlog(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const blog = await db.Blog.findOne({ where: { id } });

      if (!blog) {
        return res.status(404).send({
          message: "Blog not found.",
        });
      }

      if (blog.authorID !== userId) {
        return res.status(403).send({
          message: "You are not authorized to delete this blog.",
        });
      }

      await db.Blog.destroy({ where: { id } });

      res.send({
        message: "Blog successfully deleted.",
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({
        message: "An error occurred while deleting the blog.",
        error: error.message,
      });
    }
  },
};
