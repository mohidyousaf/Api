const joi = require("joi");
const mongoose = require("mongoose");
const Product = require("./product");

const favSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prod_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const Fav = mongoose.model("Fav", favSchema);

function validateFav(fav) {
  const schema = {
    user_id: joi.string().required(),
    prod_id: joi.string().required(),
  };
  return joi.validate(fav, schema);
}

module.exports.Fav = Fav;
module.exports.validateFav = validateFav;
