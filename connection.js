var DEFAULT_ENVIRONMENT = 'development';

var environment = process.env.MACROCOSM_ENV || DEFAULT_ENVIRONMENT;
var connection = process.env.DATABASE_URL || require('./local').connection[environment];

var knex = require('knex')({
  client: 'pg',
  connection: connection,
  debug: false,
  pool: {
    min: 2,
    max: 10
  }
});

module.exports = knex;
