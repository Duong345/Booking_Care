const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("test", "root", null, {
  host: "localhost",
  dialect: "mysql",
  logging: false,

  dialectOptions: {
    charset: "utf8mb4",
  },

  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
});

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = connectDB;
