'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transportes = [
      { id: 1, nombre: 'Combi 111', patente: 'AA111AA', marca: 'Mercedes-Benz', cantLugares: 15, empresa_id: 1, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, nombre: 'Combi 230', patente: 'DD444DD', marca: 'Scania', cantLugares: 16, empresa_id: 1, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nombre: 'Combi 125', patente: 'BB222BB', marca: 'Volkswagen', cantLugares: 15, empresa_id: 2, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, nombre: 'Combi 101', patente: 'CC333CC', marca: 'Iveco', cantLugares: 13, empresa_id: 2, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, nombre: 'Combi 505', patente: 'EE555EE', marca: 'Toyota', cantLugares: 15, empresa_id: 3, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 13, nombre: 'Combi 606', patente: 'FF666FF', marca: 'Mercedes-Benz', cantLugares: 19, empresa_id: 4, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 20, nombre: 'Combi 707', patente: 'GG777GG', marca: 'Volkswagen', cantLugares: 20, empresa_id: 5, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() }
    ];

    return queryInterface.bulkInsert('MedioTransporte', transportes, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('MedioTransporte', null, {});
  }
};
