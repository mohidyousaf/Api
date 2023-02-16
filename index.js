var winston = require("winston");
var { Loggly } = require("winston-loggly-bulk");
const config = require("config");
const express = require("express");
const app = express();
require('dotenv').config()


winston
  .add(
    new Loggly({
      token: "d38691b9-f782-4ad2-83ee-0778cd915cbd",
      subdomain: "balti",
      tags: ["Winston-NodeJS"],
      json: true
    })
  )
  .add(new winston.transports.Console());

require("./startup/routes")(app);
require("./startup/db").initializeDB();
require("./startup/prod")(app);

if (!config.get("jwtPrivateKey")) {
  // console.error("FATAL ERROR: jwtPrivateKey is not defined");
  winston.log("error", "FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

// 
let port = 3000;

app.listen(port, () => {
  // require("log-timestamp");
  winston.log("info", `Started listening on PORT=${port}`);
  console.log(`Listening on ${port}`);
});

process.on("uncaughtException", (err) => {
  // require("log-timestamp");
  // loggly.log(err, ["error"]);
  winston.log("error", err.stack);
  // console.error(err);
});


