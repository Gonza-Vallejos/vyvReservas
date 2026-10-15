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
  logging: false,
  pool: {
    max: 10,           // Maximum number of connections in pool
    min: 2,            // Minimum number of connections in pool
    acquire: 30000,    // Maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000,       // Maximum time (ms) a connection can be idle before being released
    evict: 10000        // How often (ms) to check for idle connections to evict
  }
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig
};
