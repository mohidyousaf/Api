const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = {initializeDB: () => {
  // const dbUri =
  if (!config.get("dbUri")) {
    throw new Error("Fatal Error: dbUri is not defined");
  } else {
    //mongoose.set('useCreateIndex', true)
    mongoose
      .connect(config.get("dbUri"), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        winston.log("info", "Connected to Mongodb");
        console.log("Connected to Mongodb");
        // require("log-timestamp");
        // console.error(err);
      })
      .catch(() => {
        winston.log("error", "Connection failed to MongoDB");

        // require("log-timestamp");
        // console.error("Connection Failed to Mongodb");
      });
  }
}
};
