'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Localidad', [
      { id: 1, nombre: 'Corrientes', provincia_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: 'Riachuelo', provincia_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nombre: 'San Cosme', provincia_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, nombre: 'Paso de la Patria', provincia_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, nombre: 'Goya', provincia_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, nombre: 'Lavalle', provincia_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, nombre: 'San Isidro', provincia_id: 7, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Localidad', null, {});
  }
};
