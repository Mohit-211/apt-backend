const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

const ROOT_DIR = path.resolve(__dirname, "../..");

dotenv.config({
  path: path.join(ROOT_DIR, ".env"),
});

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),

  PORT: Joi.number().default(5000),

  // Central MySQL
  CENTRAL_MYSQL_HOST: Joi.string().required(),

  CENTRAL_MYSQL_USER: Joi.string().required(),

  CENTRAL_MYSQL_PASSWORD: Joi.string().allow("").required(),

  CENTRAL_MYSQL_DB: Joi.string().required(),

  CENTRAL_MYSQL_PORT: Joi.number().default(3306),

  // Shop MySQL
  SHOP_MYSQL_HOST: Joi.string().allow(""),

  SHOP_MYSQL_USER: Joi.string().allow(""),

  SHOP_MYSQL_PASSWORD: Joi.string().allow(""),

  SHOP_MYSQL_DB: Joi.string().allow(""),

  SHOP_MYSQL_PORT: Joi.number().default(3306),

  // CERC PostgreSQL
  CERC_POSTGRES_HOST: Joi.string().allow(""),

  CERC_POSTGRES_USER: Joi.string().allow(""),

  CERC_POSTGRES_PASSWORD: Joi.string().allow(""),

  CERC_POSTGRES_DB: Joi.string().allow(""),

  CERC_POSTGRES_PORT: Joi.number().default(5432),

  // JWT
  JWT_SECRET: Joi.string().required(),

  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),

  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),

  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),

  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),

  // Email
  SMTP_HOST: Joi.string().allow(""),

  SMTP_PORT: Joi.number().default(587),

  SMTP_USERNAME: Joi.string().allow(""),

  SMTP_PASSWORD: Joi.string().allow(""),

  EMAIL_FROM: Joi.string().allow(""),

  // Application
  DEFAULT_API_DATA_LIMIT: Joi.number().default(15),

  ACCESSDOMAINS: Joi.string().allow(""),

  STORY_VALIDATION_TIME_SPAN_HOURS: Joi.number().default(24),

  API_BASE_URL: Joi.string().allow(""),

  ADMIN_BASE_URL: Joi.string().allow(""),

  DEFAULT_TIMEZONE: Joi.string().default("UTC"),

  // Stripe
  STRIPE_PUBLISHABLE_KEY: Joi.string().allow(""),

  STRIPE_SECRET_KEY: Joi.string().allow(""),

  STRIPE_WEBHOOK_SECRET_INTENT_CHARGE: Joi.string().allow(""),

  STRIPE_WEBHOOK_SECRET_CUSTOMER_INVOICE_PRICE: Joi.string().allow(""),

  // OpenAI
  OPENAI_KEY: Joi.string().allow(""),

  // Uploads storage (absolute, or relative to project root)
  STORAGE_DIR: Joi.string().default("../storage"),
}).unknown(true);

const { value: envVars, error } = envVarsSchema
  .prefs({
    errors: {
      label: "key",
    },
  })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,

  port: envVars.PORT,

  databases: {
    central: {
      db: envVars.CENTRAL_MYSQL_DB,
      port: envVars.CENTRAL_MYSQL_PORT,
      host: envVars.CENTRAL_MYSQL_HOST,
      user: envVars.CENTRAL_MYSQL_USER,
      passwd: envVars.CENTRAL_MYSQL_PASSWORD,
    },

    shop: {
      db: envVars.SHOP_MYSQL_DB,
      host: envVars.SHOP_MYSQL_HOST,
      port: envVars.SHOP_MYSQL_PORT,
      user: envVars.SHOP_MYSQL_USER,
      passwd: envVars.SHOP_MYSQL_PASSWORD,
    },

    cerc: {
      db: envVars.CERC_POSTGRES_DB,
      host: envVars.CERC_POSTGRES_HOST,
      port: envVars.CERC_POSTGRES_PORT,
      user: envVars.CERC_POSTGRES_USER,
      passwd: envVars.CERC_POSTGRES_PASSWORD,
    },
  },

  jwt: {
    secret: envVars.JWT_SECRET,

    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,

    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,

    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,

    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },

  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      secure: true,
      requireTLS: false,

      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },

    from: envVars.EMAIL_FROM,
  },

  accessDomains: envVars.ACCESSDOMAINS,

  defaultLimit: envVars.DEFAULT_API_DATA_LIMIT,

  API_BASE_URL: envVars.API_BASE_URL,

  ADMIN_BASE_URL: envVars.ADMIN_BASE_URL,

  DEFAULT_TIMEZONE: envVars.DEFAULT_TIMEZONE,

  STORY_VALIDATION_TIME_SPAN_HOURS: envVars.STORY_VALIDATION_TIME_SPAN_HOURS,

  STRIPE_PUBLISHABLE_KEY: envVars.STRIPE_PUBLISHABLE_KEY,

  STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY,

  STRIPE_WEBHOOK_SECRET_INTENT_CHARGE:
    envVars.STRIPE_WEBHOOK_SECRET_INTENT_CHARGE,

  STRIPE_WEBHOOK_SECRET_CUSTOMER_INVOICE_PRICE:
    envVars.STRIPE_WEBHOOK_SECRET_CUSTOMER_INVOICE_PRICE,

  OPENAI_KEY: envVars.OPENAI_KEY,

  storageDir: path.resolve(ROOT_DIR, envVars.STORAGE_DIR),
};
