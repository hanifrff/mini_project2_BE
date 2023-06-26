const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const hbs = require("handlebars");
const db = require("../models");
const transporter = require("../helper/transporter");
const crypto = require("crypto");
const fs = require("fs");

const { user } = db;

const secretKey = process.env.JWT_SECRET_KEY;

const generateJWT = (newUser) => {
  const token = jwt.sign({ id: newUser.id }, secretKey, {
    expiresIn: "1h",
  });
  return token;
};

module.exports = {
  async register(req, res) {
    const { username, email, phoneNumber, password, confirmPassword } =
      req.body;
    try {
      const isExist = await user.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ username }, { email }, { phoneNumber }],
        },
      });

      if (isExist) {
        res.status(400).send({
          message: "username/email/phone number already registered",
        });
        return;
      }
      // generate random verification
      const verifyToken = crypto.randomBytes(16).toString("hex");

      // generate password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = await user.create({
        username,
        email,
        phoneNumber,
        password: hashPassword,
        verifyToken,
      });
      const link = `${process.env.FE_BASEPATH}/verify/${verifyToken}`;
      const template = fs.readFileSync("./templates/register.html", "utf-8");
      const templateCompile = hbs.compile(template);
      const htmlResult = templateCompile({ username, link });

      try {
        await transporter.sendMail({
          from: "Muman Blog",
          to: email,
          subject: "Thanks your for your registration",
          html: htmlResult,
        });
      } catch (error) {
        // Handle the error occurred during sending the email
        return res.status(500).send({
          message: "Failed to send verification email",
          error: error.message,
        });
      }

      if (newUser) {
        res.status(201).send({
          message: "registration success",
          data: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
          },
        });
      }
    } catch (error) {
      return res.status(500).send({
        message: "something wrong in the server",
        errors: error.message,
      });
    }
  },
  async verify(req, res) {
    const token = req.body.verifyToken;
    try {
      const userData = await db.user.findOne({
        where: {
          verifyToken: token,
        },
      });
      if (!userData) {
        return res.status(400).send({
          message: "verification token is invalid",
        });
      }
      if (userData.isVerified) {
        return res.status(400).send({
          message: "user already verified",
        });
      }
      // check if verifytoken expired or not.
      // const createdAt = new Date(userData.verifyTokenCreatedAt);
      // const now = new Date();
      // // set createdat to next 1 hour
      // createdAt.setHours(createdAt.getHours() + 1);
      // if (now > createdAt) {
      //   return res.status(400).send({
      //     message: "verify token is already expired",
      //   });
      // }

      // save to db
      userData.isVerified = true;
      userData.verifyToken = null;
      userData.verifyTokenCreatedAt = null;
      await userData.save();

      res.send({
        message: "verification process is success",
      });
    } catch (errors) {
      console.error(errors);
      res.status(500).send({
        message: "fatal error on server",
        error: errors.message,
      });
    }
  },
  async login(req, res) {
    const { user_identification, password } = req.body;
    try {
      const User = await user.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { email: user_identification },
            { phoneNumber: user_identification },
            { username: user_identification },
          ],
        },
      });
      if (!User) {
        return res.status(400).send({
          message: "login failed, incorrect identity/password",
        });
      }
      if (User.isSuspended) {
        return res.status(400).send({
          message: "login failed, account suspended",
        });
      }

      const isValid = await bcrypt.compare(password, User.password);
      if (!isValid) {
        return res.status(400).send({
          message: "login failed, incorrect identity/password",
        });
      }

      res.status(200).send({
        message: "Welcome to Blog",
        isAccountExist: User,
        token: generateJWT(User),
      });
    } catch (error) {
      console.error(error);
      res.status(400).send({
        message: "login failed, incorrect username/password",
        errors: error.message,
      });
    }
  },

  async forgot(req, res) {
    const { email } = req.body;

    try {
      const userData = await db.user.findOne({ where: { email } });
      if (!userData) {
        return res.status(500).send({
          message: "user is not found",
        });
      }

      // generate forgot token
      const forgotToken = crypto.randomBytes(16).toString("hex");
      const username = userData.username;
      const time = new Date();

      // render template html email
      const link = `${process.env.FE_BASEPATH}/reset-pass/${forgotToken}`;
      const template = fs.readFileSync("./templates/forgot.html", "utf-8");
      const templateCompile = hbs.compile(template);
      const htmlResult = templateCompile({ username, link });
      // send email
      await transporter.sendMail({
        from: "Mumans Blog",
        to: email,
        subject: "Reset Password",
        html: htmlResult,
      });

      // save token to db
      userData.forgotToken = forgotToken;
      userData.forgotTokenCreatedAt = time;
      await userData.save();

      res.send({
        message: "reset password success, check your email!",
      });
    } catch (errors) {
      console.error(errors);
      res.status(500).send({
        message: "fatal error on server",
        error: errors.message,
      });
    }
  },
  async reset(req, res) {
    const { token, password, confirmPassword } = req.body;
    try {
      const userData = await db.user.findOne({
        where: {
          forgotToken: token,
        },
      });
      if (!userData) {
        return res.status(400).send({ message: "token is not valid" });
      }

      // check token expiration
      const tokenCA = new Date(userData.forgotTokenCreatedAt);
      const now = new Date();
      tokenCA.setHours(tokenCA.getHours() + 1);

      if (now > tokenCA) {
        return res.status(400).send({
          message: "token is already expired",
        });
      }

      // generate password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      userData.password = hashPassword;

      userData.forgotToken = null;
      userData.forgotTokenCreatedAt = null;
      await userData.save();
      res.send({
        message: "password is resetted, try to login now!",
      });
    } catch (errors) {
      console.error(errors);
      res.status(500).send({
        message: "fatal error on server",
        error: errors.message,
      });
    }
  },
};
