const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../config/central.db");

class Template extends Model { }
Template.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        main_content: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT(),
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
        tableName: "templates",
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

Template.beforeUpdate((Template) => {
    Template.updated_at = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/g, "");
});

Template.beforeDestroy((Template) => {
    Template.deleted_at = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/g, "");
    Template.is_active = false;
});

module.exports = Template;
