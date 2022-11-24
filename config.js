const config = require("./package.json").projectConfig;

module.exports = {
  mongoConfig: {
    connectionUrl: config.mongoConnectionUrl,
    database: "food_react_native_db",
    collections: {
      USERS: "users",
      RESTAURANTS: "restaurants",
      FOODS: "foods",
      CARTS: "carts",
      BOOKMARKS: "bookmarks",
    },
  },
  serverConfig: {
    ip: config.serverIp,
    port: config.serverPort,
  },
  tokenSecret: "food-app-rn-secret",
};
