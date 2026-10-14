"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reserva extends Model {
    static associate(models) {
      // Definir asociaciones aquí
      Reserva.belongsTo(models.Usuario, {
        foreignKey: "usuarios_id",
        targetKey: "id",
      });
      Reserva.belongsTo(models.Viajes, {
        foreignKey: "viajes_id",
        targetKey: "id",
      });
      Reserva.hasMany(models.Pasajeros, {
        foreignKey: "reserva_id",
      });
      Reserva.hasMany(models.Ventas, {
        foreignKey: "reserva_id",
      });
      Reserva.hasMany(models.Pago, {
        foreignKey: "reserva_id",
      });
    }
  }

  Reserva.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fechaReserva: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usuarios_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      viajes_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idempotencyKey: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      eliminado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "no",
      },
    },
    {
      sequelize,
      modelName: "Reserva",
      tableName: "Reservas",
    }
  );

  return Reserva;
};
