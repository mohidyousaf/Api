var mongoose = require("mongoose");
var Joi = require("joi")


const geoSchema = mongoose.Schema({
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    }
  });  

  module.exports = { geoSchema }