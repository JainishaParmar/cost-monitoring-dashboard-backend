'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cost_records', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      service_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cost_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      region: {
        type: Sequelize.STRING,
        allowNull: false
      },
      account_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      resource_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      usage_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('cost_records', ['date']);
    await queryInterface.addIndex('cost_records', ['service_name']);
    await queryInterface.addIndex('cost_records', ['region']);
    await queryInterface.addIndex('cost_records', ['account_id']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cost_records');
  }
};
