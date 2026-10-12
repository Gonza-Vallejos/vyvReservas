require("dotenv").config();

const baseConfig = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig
};
