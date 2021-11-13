require('dotenv/config')

module.exports = {
  client: 'postgresql',
  connection: process.env.POSTGRES_URI,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
