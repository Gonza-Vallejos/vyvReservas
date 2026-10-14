'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WebhookEvents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      resourceId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('WebhookEvents', ['topic', 'resourceId'], {
      unique: true,
      name: 'webhook_events_topic_resourceId_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WebhookEvents');
  }
};
