var loggly = require("loggly");
var client = loggly.createClient({
  token: "f55ab4ea-ef6a-482c-9b05-b88f4053bed8",
  subdomain: "Organic-Commmunity-Market",
  tags: ["Winston-NodeJS"],
  json: true,
});

module.exports.logglylo = client;
