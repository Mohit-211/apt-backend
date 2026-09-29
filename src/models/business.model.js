const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../config/central.db");

class Business extends Model { }
Business.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        location: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "business",
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

Business.beforeUpdate((Business) => {
    Business.updated_at = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/g, "");
});

Business.beforeDestroy((Business) => {
    Business.deleted_at = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/g, "");
    Business.is_active = false;
});

module.exports = Business;
