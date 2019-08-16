require('dotenv').config();


module.exports = {
  development: {
    use_env_variable: process.env.DATABASE_URL,
    dialect: 'mysql',
    logging: false,
  },
  test: {
    use_env_variable: process.env.DATABASE_URL,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    use_env_variable: process.env.DATABASE_URL,
    dialect: 'mysql',
    logging: false,
  },
};