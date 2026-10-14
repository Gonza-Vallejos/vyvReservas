'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pasajeros', 'numeroAsiento', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Número de asiento asignado al pasajero dentro del viaje'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pasajeros', 'numeroAsiento');
  }
};
