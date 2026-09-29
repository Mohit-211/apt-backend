const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/central.db');

class AiChat extends Model { };
AiChat.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        conversation_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'conversations',
                key: 'id',
            },
        },
        business_id: {
            type: DataTypes.INTEGER,
            default: null,
        },
        template_id: {
            type: DataTypes.INTEGER,
            default: null,
        },
        query: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        short_message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        long_message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
        tableName: 'ai_chats',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    }
);


AiChat.beforeUpdate((AiChat) => {
    AiChat.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/g, '');
});

AiChat.beforeDestroy((AiChat) => {
    AiChat.deleted_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/g, '');
    AiChat.is_active = false;
});

module.exports = AiChat;
