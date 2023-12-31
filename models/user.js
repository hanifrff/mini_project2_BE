// const { sequelize } = require("../models/index");
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.Blog, {
        foreignKey: "authorID",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        hooks: true,
      });
      user.hasMany(models.like, {
        foreignKey: "blogID",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        hooks: true,
      });
    }
  }
  user.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      password: DataTypes.STRING,
      imgProfile: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN,
      verifyToken: DataTypes.STRING,
      imgProfile: DataTypes.STRING,
      forgotToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
    }
  );
  return user;
};
