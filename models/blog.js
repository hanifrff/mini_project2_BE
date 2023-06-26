"use strict";
const { Model } = require("sequelize");
const { convertFromDBtoRealPath } = require("../utils/file");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Blog.belongsTo(models.user, {
        foreignKey: "authorID",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        hooks: true,
      });
      Blog.hasMany(models.like, {
        foreignKey: "blogID",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        hooks: true,
      });
    }
  }
  Blog.init(
    {
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      authorID: DataTypes.INTEGER,
      imgURL: {
        type: DataTypes.STRING,
        // get() {
        //   const rawValue = this.getDataValue("imageURL");
        //   if (rawValue) {
        //     return convertFromDBtoRealPath(rawValue);
        //   }
        //   return null;
        // },
      },
      videoURL: DataTypes.STRING,
      keywords: DataTypes.STRING,
      country: DataTypes.STRING,
      category: DataTypes.ENUM(
        "Umum",
        "Olahraga",
        "Ekonomi",
        "Politik",
        "Bisnis",
        "Fiksi"
      ),
    },
    {
      sequelize,
      modelName: "Blog",
    }
  );
  return Blog;
};
