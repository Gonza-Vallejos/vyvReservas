'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Pagos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      reserva_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Reservas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      monto: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pendiente'
      },
      mp_preference_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mp_payment_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mp_external_reference: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mp_init_point: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fechaActualizacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      eliminado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'no'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Pagos');
  }
};
