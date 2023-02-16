const joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
const { geoSchema } = require("./geoLocation")

var userSchema = mongoose.Schema({
  name: String,
  number: String,
  password: String,
  location: {
    type: geoSchema,
    index: '2dsphere'
},
  locationDesc: String,
  email: String,
  role: {
    type: String,
    default: "user",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this.id, name: this.name, role: this.role, email: this.email },
    config.get("jwtPrivateKey"),
    { expiresIn: "30d" }
  );
  //console.log(process.env.baltiApp_jwtPrivateKey);
  return token;
};

function validate(user) {
  const schema = {
    name: joi.string().min(2).max(50).required(),
    number: joi.string(),
    password: joi.string().min(5).max(255).required(),
    location: joi.object(),
    email: joi.string().min(5).max(255).required().email().required(),
    address: joi.string(),
    locationDesc: joi.string(),
    isBlocked: joi.boolean(),
    //picture
  };
  return joi.validate(user, schema);
}

function validateUpdate(user) {
  const schema = {
    name: joi.string().min(2).max(50),
    number: joi.string(),
    password: joi.string().min(5).max(255),
    location: joi.string(),
    locationDesc: joi.string(),
    email: joi.string().min(5).max(255).email(),
    isBlocked: joi.boolean(),
    //picture
  };
  return joi.validate(user, schema);
}

var User = mongoose.model("User", userSchema);

module.exports.User = User;
module.exports.validate = validate;
module.exports.validateUpdate = validateUpdate;
