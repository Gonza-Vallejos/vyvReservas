'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const ahora = new Date();
    const asociaciones = [];
    
    // Asociamos algunos usuarios a empresas
    // Por ejemplo, usuario 13 a empresa 1, usuario 17 a empresa 2, etc.
    const mappings = [
      { id: 1, id_usuario: 13, id_empresa: 1 },
      { id: 2, id_usuario: 17, id_empresa: 2 },
      { id: 3, id_usuario: 21, id_empresa: 3 },
      { id: 4, id_usuario: 25, id_empresa: 4 },
      { id: 5, id_usuario: 30, id_empresa: 5 }
    ];

    mappings.forEach(m => {
      asociaciones.push({
        id: m.id,
        id_usuario: m.id_usuario,
        id_empresa: m.id_empresa,
        createdAt: ahora,
        updatedAt: ahora
      });
    });

    await queryInterface.bulkInsert('usuarioEmpresa', asociaciones, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarioEmpresa', null, {});
  }
};
