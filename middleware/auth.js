const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;
const db = require("../models");

module.exports = {
  // authentication
  async verifyToken(req, res, next) {
    // check token valid or not
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).send({
        message: "token is not found",
      });
      return;
    }

    const [format, token] = authorization.split(" ");
    if (format.toLocaleLowerCase() === "bearer") {
      try {
        const payload = jwt.verify(token, secretKey);
        if (!payload) {
          res.status(401).send({
            message: "token verification failed",
          });
          return;
        }
        req.user = payload;
        next();
      } catch (error) {
        res.status(401).send({
          message: "invalid token",
          error,
        });
      }
    }
  },
  async isUserVerified(req, res, next) {
    try {
      const verified = await db.user.findOne({
        where: { id: req.user.id },
      });

      if (verified.dataValues.isVerified) {
        return next();
      }

      // User is verified, proceed to the next middleware or route handler
    } catch (errors) {
      res.status(401).send({
        message: "your account is not verified",
        errors: errors.message,
      });
    }
  },
};
