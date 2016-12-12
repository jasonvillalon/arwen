module.exports = {
  debug: false,

  // Connection information for Postgres
  // TODO: Get from etcd (not env vars)
  db: {
    name: "<%= dbName %>",
    host: process.env.DB_PORT_5432_TCP_ADDR,
    user: "<%= dbUser %>",
    password: "<%= dbPass %>",
    port: parseInt(process.env.DB_PORT_5432_TCP_PORT)
  },

};
