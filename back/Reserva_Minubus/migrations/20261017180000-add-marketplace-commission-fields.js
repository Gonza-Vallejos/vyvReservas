'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Campos para Empresa (Marketplace & Comisión)
    await queryInterface.addColumn('Empresa', 'comision_porcentaje', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 10.0,
      comment: 'Porcentaje de comisión que retiene la plataforma (ej: 10.0%)'
    });

    await queryInterface.addColumn('Empresa', 'mp_user_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'ID de usuario o Collector ID en Mercado Pago'
    });

    await queryInterface.addColumn('Empresa', 'mp_access_token', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Access token OAuth de Mercado Pago de la empresa'
    });

    await queryInterface.addColumn('Empresa', 'mp_public_key', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Public key de Mercado Pago de la empresa'
    });

    await queryInterface.addColumn('Empresa', 'mp_refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Refresh token para renovar credenciales OAuth'
    });

    await queryInterface.addColumn('Empresa', 'mp_vinculado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si la empresa vinculó su cuenta de Mercado Pago'
    });

    // 2. Campos para Pagos (Split de comisiones)
    await queryInterface.addColumn('Pagos', 'empresa_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Empresa',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Pagos', 'monto_comision', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Monto de comisión para el Super Admin / Plataforma'
    });

    await queryInterface.addColumn('Pagos', 'monto_empresa', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Monto neto que percibe la empresa'
    });

    await queryInterface.addColumn('Pagos', 'porcentaje_comision', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 10.0,
      comment: 'Porcentaje de comisión aplicado a esta transacción'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Pagos', 'porcentaje_comision');
    await queryInterface.removeColumn('Pagos', 'monto_empresa');
    await queryInterface.removeColumn('Pagos', 'monto_comision');
    await queryInterface.removeColumn('Pagos', 'empresa_id');

    await queryInterface.removeColumn('Empresa', 'mp_vinculado');
    await queryInterface.removeColumn('Empresa', 'mp_refresh_token');
    await queryInterface.removeColumn('Empresa', 'mp_public_key');
    await queryInterface.removeColumn('Empresa', 'mp_access_token');
    await queryInterface.removeColumn('Empresa', 'mp_user_id');
    await queryInterface.removeColumn('Empresa', 'comision_porcentaje');
  }
};
