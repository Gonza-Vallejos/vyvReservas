"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DetalleVenta extends Model {
    static associate(models) {
      // Definir asociaciones aquí
      DetalleVenta.belongsTo(models.Ventas, {
        foreignKey: "ventas_id",
        targetKey: "id",
      });
    }
  }

  DetalleVenta.init(
    {
      formaPago: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subTotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      descuento: {
        type: DataTypes.FLOAT,
      },
      precioFinal: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      ventas_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eliminado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "no",
      },
    },
    {
      sequelize,
      modelName: "DetalleVenta",
      tableName: "DetalleVenta",
    }
  );

  return DetalleVenta;
};
