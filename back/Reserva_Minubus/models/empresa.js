"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Empresa extends Model {
    static associate(models) {
      // Definir asociaciones aquí
      Empresa.belongsTo(models.Localidad, {
        foreignKey: "localidad_id",
        targetKey: "id",
      });
      Empresa.hasMany(models.MedioTransporte, {
        foreignKey: "empresa_id",
      });

      Empresa.belongsToMany(models.Usuario, {
        through: "usuarioEmpresa",
        foreignKey: "id_empresa",
        otherKey: "id_usuario",
      });

      Empresa.hasMany(models.Pago, {
        foreignKey: "empresa_id",
      });
    }
  }

  Empresa.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cuit: {
        type: DataTypes.STRING, // <== CAMBIO
        allowNull: false,
        unique: true,
      },
      telefono: {
        type: DataTypes.STRING, // <== CAMBIO
        allowNull: false,
        unique: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      localidad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comision_porcentaje: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 10.0,
      },
      mp_user_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mp_access_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mp_public_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mp_refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mp_vinculado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      eliminado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "no",
      },
    },
    {
      sequelize,
      modelName: "Empresa",
      tableName: "Empresa",
    }
  );

  return Empresa;
};
