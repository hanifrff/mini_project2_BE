const db = require("../models");
const bcrypt = require("bcryptjs");
const {
  setFromFileNameToDBValue,
  getFilenameFromDbValue,
  getAbsolutePathPublicFile,
} = require("../utils/file");
const fs = require("fs");

module.exports = {
  async getLoggedInProfile(req, res) {
    try {
      const user = await db.user.findOne({
        where: {
          id: req.user.id,
        },
        attributes: {
          exclude: ["password"],
        },
      });
      res.send({ message: "get profile success", data: user });
    } catch (error) {
      res.status(500).send({ message: "fatal error on server", error });
    }
  },
  async updateProfile(req, res) {
    const userId = req.user.id;
    const { email, username, phoneNumber } = req.body;

    try {
      const userData = await db.user.findOne({ where: { id: userId } });
      if (username) {
        userData.username = username;
      }
      if (email) {
        userData.email = email;
      }
      if (phoneNumber) {
        userData.phoneNumber = phoneNumber;
      }

      await userData.save();

      res.send({
        message: "success update profile",
        data: userData,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error on server",
        errors: error,
      });
    }
  },
  async changePassword(req, res) {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    try {
      const userData = await db.user.findOne({
        where: {
          id: req.user.id,
        },
      });

      //compare oldPass to db
      const oldPassValid = await bcrypt.compare(oldPassword, userData.password);
      if (!oldPassValid) {
        return res.status(404).send({
          message: "incorrect old password",
        });
      }

      //compare newPass to confirmPass
      if (confirmNewPassword !== newPassword) {
        return res.status(400).send({
          messasge: "confirm Password didn't match",
        });
      }

      //generate password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);

      //change password
      userData.password = hashPassword;
      await userData.save();
      res.status(200).send({
        message: "your password has been changed",
        userData,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "fatal error on server", error: error.message });
    }
  },
  async updateProfilePicture(req, res) {
    const userId = req.user.id;

    try {
      const userData = await db.user.findOne({ where: { id: userId } });
      if (!userData) {
        return res.status(404).send({ message: "User not found" });
      }

      // Check if a new profile picture was uploaded
      if (req.file) {
        const realimageURL = userData.getDataValue("imgProfile");
        if (realimageURL) {
          const oldFilename = getFilenameFromDbValue(realimageURL);
          if (oldFilename) {
            fs.unlinkSync(getAbsolutePathPublicFile(oldFilename));
          }
          userData.imgProfile = setFromFileNameToDBValue(req.file.filename);
        } else {
          // Handle the case where realimageURL is null
          // Set imgProfile to the new filename directly
          userData.imgProfile = setFromFileNameToDBValue(req.file.filename);
        }
      }
      await userData.save();

      res.send({
        message: "Success update profile picture",
        data: userData,
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        error: error.message,
      });
    }
  },
  async closeAccount(req, res) {
    try {
      const userId = req.user.id;

      const userData = await db.user.findOne({ where: { id: userId } });

      if (!userData) {
        return res.status(404).send({ message: "User not found" });
      }

      await userData.destroy();

      res.send({
        message: "Account closed successfully",
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        error: error.message,
      });
    }
  },
};
