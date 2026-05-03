require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: 'DB_CONNECTION_STRING',
    dialect: 'postgres'
  },
  production: {
    use_env_variable: 'DB_CONNECTION_STRING',
    dialect: 'postgres'
  }
};