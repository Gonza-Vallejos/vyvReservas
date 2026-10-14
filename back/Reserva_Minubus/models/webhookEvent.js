"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WebhookEvent extends Model {}

  WebhookEvent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WebhookEvent",
      tableName: "WebhookEvents",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["topic", "resourceId"],
        },
      ],
    }
  );

  return WebhookEvent;
};
