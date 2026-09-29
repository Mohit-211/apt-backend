const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/central.db');
// const slugify = require("slugify");

class Conversation extends Model { };
Conversation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'conversations',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    }
);

// Conversation.beforeValidate((Conversation) => {
//     if (Conversation.title) {
//         Conversation.slug = slugify(Conversation.title, { lower: true });
//     }
// });

Conversation.beforeUpdate((Conversation) => {
    Conversation.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/g, '');
});

Conversation.beforeDestroy((Conversation) => {
    Conversation.deleted_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/g, '');
    Conversation.is_active = false;
});

module.exports = Conversation;
