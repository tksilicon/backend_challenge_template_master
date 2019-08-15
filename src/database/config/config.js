require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: process.env.DATABASE_URL,
    dialect: 'mysql',
    logging: false,
  },
  test: {
    username: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASS,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
};

"development": {  "use_env_variable": "DATABASE_URL"
},