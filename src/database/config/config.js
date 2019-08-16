require('dotenv').config();



module.exports = {
  "development": {
   "use_env_variable": process.env.DATABASE_URL,
  },
  "test": {
   "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "logging": false,
  },
  "production": {
    "use_env_variable": process.env.DATABASE_URL,
  },
};