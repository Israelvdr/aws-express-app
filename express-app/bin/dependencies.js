require('dotenv').config();
var rsdi = require('rsdi');
var psql_db = require('../psql-db/psql-db');
var build_answers_router = require('../routes/answers');
var build_questions_router = require('../routes/questions');

module.exports = function configure_DI() {
  var di_container = new rsdi.DIContainer()
  di_container.add("db_client", () => {
    var db_url = process.env.POSTGRES_URL || "localhost";
    var db_port = process.env.POSTGRES_PORT || 5432; // Default to 5432 if not set
    var db_name = process.env.POSTGRES_DB || "postgres";
    var db_user = process.env.POSTGRES_USER || "user";
    var db_password = process.env.POSTGRES_PASSWORD; //! TODO: use secrets
    var retry_delay = process.env.APP_DB_RETRY_DELAY || 5000; // Default to 5 seconds
    var max_retries = process.env.APP_DB_MAX_RETRIES || 5; // Default
    return new psql_db({
      db_url,
      db_port,
      db_name,
      db_user,
      db_password,
      retry_delay,
      max_retries
    })
  });
  di_container.add("answers_router", () => {
    return build_answers_router(di_container.db_client);
  });
  di_container.add("questions_router", () => {
    return build_questions_router(di_container.db_client);
  });
  di_container.add("port", () => { return normalizePort(process.env.EXPRESS_PORT || '5000') });
  di_container.add("env", () => { return process.env.ENVIRONMENT || 'development' });

  return di_container;
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}