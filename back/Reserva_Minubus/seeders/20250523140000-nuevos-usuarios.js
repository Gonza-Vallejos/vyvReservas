'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    const hash = await bcrypt.hash('password.1', saltRounds);

    const usuarios = [];
    for (let i = 1; i <= 50; i++) {
      usuarios.push({
        id: i,
        nombre: `Usuario${i}`,
        apellido: `Test${i}`,
        dni: 10000000 + i,
        telefono: `3794${String(100000 + i)}`, // Teléfono único
        email: `usuario${i}@example.com`,
        usuario: `user${String(100 + i)}`, // Aseguramos longitud > 4
        contrasenia: hash,
        perfil_id: (i % 5) + 1,
        verificado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('usuarios', usuarios, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
