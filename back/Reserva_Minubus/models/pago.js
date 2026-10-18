"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Pago extends Model {
    static associate(models) {
      Pago.belongsTo(models.Reserva, {
        foreignKey: "reserva_id",
        targetKey: "id"
      });
      Pago.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        targetKey: "id"
      });
    }
  }

  Pago.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reserva_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      empresa_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      monto: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      monto_comision: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      monto_empresa: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      porcentaje_comision: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 10.0
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pendiente"
      },
      mp_preference_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mp_payment_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mp_external_reference: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mp_init_point: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      fechaActualizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      eliminado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "no"
      }
    },
    {
      sequelize,
      modelName: "Pago",
      tableName: "Pagos",
      timestamps: false
    }
  );

  return Pago;
};
