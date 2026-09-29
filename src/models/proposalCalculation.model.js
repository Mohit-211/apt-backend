const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../config/central.db");

class ProposalCalculation extends Model {}

ProposalCalculation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    draft_name: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    calculator_name: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    proposal_name: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    proposal_data: {
      type: DataTypes.TEXT(),
      allowNull: true,
    },
    calculator_data: {
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
    tableName: "proposal_calculation",
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

ProposalCalculation.beforeUpdate(async (ProposalCalculation) => {
  ProposalCalculation.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

ProposalCalculation.beforeDestroy(async (ProposalCalculation) => {
  ProposalCalculation.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
  ProposalCalculation.is_active = false;
});

module.exports = ProposalCalculation;
