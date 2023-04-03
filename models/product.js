const joi = require("joi");
var mongoose = require("mongoose");

var productSchema = mongoose.Schema({
  business_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  name: String,
  price: Number,
  rating: {
    type: Number,
    default: null,
  },
  duration: Number,
  description: String,
  images: [String],
  videos: [String],
  files: [Buffer]
});

var Product = mongoose.model("Product", productSchema);

function validate(user) {
  const schema = {
    business_id: joi.string().required(),
    name: joi.string().required(),
    price: joi.string().required(),
    description: joi.string(),
    rating: joi.number(),
    images: joi.array().items(),
    videos: joi.array().items(joi.string()),
    files: joi.array().items()
  };
  return joi.validate(user, schema);
}

module.exports.Product = Product;
module.exports.productSchema = productSchema;
module.exports.validate = validate;
