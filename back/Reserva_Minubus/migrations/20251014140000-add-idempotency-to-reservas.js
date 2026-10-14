'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Reservas', 'idempotencyKey', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'Clave de idempotencia para evitar reservas duplicadas'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Reservas', 'idempotencyKey');
  }
};
