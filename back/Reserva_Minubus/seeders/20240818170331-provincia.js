'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Provincia', [
      { id: 1, nombre: 'Buenos Aires', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: 'Catamarca', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nombre: 'Chaco', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, nombre: 'Chubut', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, nombre: 'CABA', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, nombre: 'Córdoba', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, nombre: 'Corrientes', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, nombre: 'Entre Ríos', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 9, nombre: 'Formosa', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 10, nombre: 'Jujuy', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 11, nombre: 'La Pampa', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 12, nombre: 'La Rioja', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 13, nombre: 'Mendoza', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 14, nombre: 'Misiones', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 15, nombre: 'Neuquén', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 16, nombre: 'Río Negro', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 17, nombre: 'Salta', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 18, nombre: 'San Juan', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 19, nombre: 'San Luis', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 20, nombre: 'Santa Cruz', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 21, nombre: 'Santa Fe', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 22, nombre: 'Santiago del Estero', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 23, nombre: 'Tierra del Fuego', pais_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 24, nombre: 'Tucumán', pais_id: 1, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Provincia', null, {});
  }
};
