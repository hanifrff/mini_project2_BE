"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addConstraint("users", {
      type: "unique",
      fields: ["username", "email", "phoneNumber"],
    });
    await queryInterface.addConstraint("users", {
      allowNull: false,
      fields: ["username", "email", "phoneNumber"],
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint("users", {
      type: "unique",
      fields: ["username", "email", "phoneNumber"],
    });
    await queryInterface.removeConstraint("users", {
      allowNull: true,
      fields: ["username", "email", "phoneNumber"],
    });
  },
};
