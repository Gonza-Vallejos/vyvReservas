'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Empresa', [
      { id: 1, nombre: 'Transportes Vargas S.A.', direccion: 'Av. Corrientes 1234', cuit: 20345678901, telefono: 1144455566, email: 'contacto@vargas.com', localidad_id: 1, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: 'Vallejos Express', direccion: 'Calle Mitre 567', cuit: 20345678902, telefono: 1122233344, email: 'info@vallejos.com', localidad_id: 1, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nombre: 'Minibus Corrientes', direccion: 'Ruta 12 km 5', cuit: 20345678903, telefono: 1133344455, email: 'corrientes@minibus.com', localidad_id: 1, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, nombre: 'Rápido San Luis', direccion: 'Belgrano 900', cuit: 20345678904, telefono: 1155566677, email: 'rapido@sanluis.com', localidad_id: 1, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, nombre: 'Viajes Itatí', direccion: '25 de Mayo 100', cuit: 20345678905, telefono: 1166677788, email: 'itati@viajes.com', localidad_id: 1, eliminado: 'no', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Empresa', null, {});
  }
};