'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id:         { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      username:      { type: Sequelize.TEXT, allowNull: false, unique: true },
      password:  { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
