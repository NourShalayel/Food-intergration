require("dotenv").config();

module.exports = {
  production: {
    username: process.env["DB_USERNAME"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    host: process.env["DB_HOST"],
    dialect: "mssql",
    dialectOptions: {
      dialectVersion: "4.0",
    },
  },
  development: {
    username: process.env["DB_USERNAME"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    host: process.env["DB_HOST"],
    dialect: "mssql",
    dialectOptions: {
      dialectVersion: "4.0",
    },
  },
};

module.exports.config = {
  server: process.env["SERVER"],
  // other properties can go here
};
