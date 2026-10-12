"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Provincia extends Model {
    static associate(models) {
      Provincia.belongsTo(models.Pais, {
        foreignKey: "pais_id",
        targetKey: "id",
      });
      Provincia.hasMany(models.Localidad, {
        foreignKey: "provincia_id",
      });
    }
  }

  Provincia.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pais_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Provincia",
      tableName: "Provincia",
      timestamps: false,
    }
  );

  return Provincia;
};
