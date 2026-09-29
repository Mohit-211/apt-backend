const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../config/central.db");

class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM,
      values: ["Male", "Female", "Others"],
      allowNull: true,
    },
    dialing_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    user_status: {
      type: DataTypes.ENUM,
      values: ["ACTIVATE", "ACTIVATE TRIAL", "DEACTIVATE"],
      allowNull: true,
      defaultValue: "ACTIVATE",
    },
    // payment_status: {
    //   type: DataTypes.ENUM,
    //   values: ["PAID", "FREE TRIAL"],
    //   allowNull: true,
    //   defaultValue: "PAID",
    // },
    subscription_status: {
      type: DataTypes.ENUM,
      values: ["PAID", "FREE TRIAL"],
      allowNull: true,
      defaultValue: "PAID",
    },
    mobile: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bussiness_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referred_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proof: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remember_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_proof_verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
     old_user: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_trial_period: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    trial_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    stripe_customer_id: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

User.isEmailTaken = async function (email) {
  let u = await this.findOne({ where: { email: email.toLowerCase() } });
  return u;
};

User.isUserNameTaken = async function (user_name) {
  let u_n = await this.findOne({
    where: { user_name: user_name, is_active: true },
  });
  return !!u_n;
};

User.beforeUpdate(async (User) => {
  User.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});
User.beforeDestroy(async (User) => {
  User.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
  User.is_active = false;
});

module.exports = User;
