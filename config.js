const config = require("./package.json").projectConfig;

module.exports = {
  mongoConfig: {
    connectionUrl: config.mongoConnectionUrl,
    database: "food_react_native_db",
    collections: {
      USERS: "users",
      RESTAURANTS: "restaurants"
    },
  },
  serverConfig: {
    ip: config.serverIp,
    port: config.serverPort,
  },
  tokenSecret: "food-app-rn-secret",
};
