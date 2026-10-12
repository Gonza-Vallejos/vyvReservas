"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Localidad extends Model {
    static associate(models) {
      Localidad.belongsTo(models.Provincia, {
        foreignKey: "provincia_id",
        targetKey: "id",
      });
      Localidad.hasMany(models.Empresa, {
        foreignKey: "localidad_id",
      });
    }
  }

  Localidad.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provincia_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Localidad",
      tableName: "Localidad",
      timestamps: false,
    }
  );

  return Localidad;
};
