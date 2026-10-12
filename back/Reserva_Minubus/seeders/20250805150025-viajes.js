'use strict';

const localidades = ["Corrientes","Riachuelo","San Cosme","Paso de la Patria","Goya","Lavalle","San Isidro"];

function localidadAleatoria(excluir) {
  let random;
  do {
    random = localidades[Math.floor(Math.random() * localidades.length)];
  } while (random === excluir);
  return random;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const viajes = [];
    const transportesDisponibles = [
      { id: 1, cantLugares: 15 },
      { id: 8, cantLugares: 16 },
      { id: 3, cantLugares: 15 },
      { id: 4, cantLugares: 13 },
      { id: 5, cantLugares: 15 },
      { id: 13, cantLugares: 19 },
      { id: 20, cantLugares: 20 }
    ];

    for (let i = 0; i < 10; i++) {
      const origen = localidadAleatoria();
      const destino = localidadAleatoria(origen);
      const transporte = transportesDisponibles[Math.floor(Math.random() * transportesDisponibles.length)];

      viajes.push({
        origenLocalidad: origen,
        destinoLocalidad: destino,
        horarioSalida: '10:00:00',
        fechaViaje: new Date(),
        precio: 5000.00,
        cantPasajeros: transporte.cantLugares,
        usuarioEmpresa_id: 1, // ID de la tabla usuarioEmpresa (creado en su seeder)
        medioTransporte_id: transporte.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('viajes', viajes, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('viajes', null, {});
  }
};
