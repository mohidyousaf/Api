var mongoose = require("mongoose");
const joi = require("joi");
var cartSchema = mongoose.Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  Business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true
  },

  products: [
    {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Product",
    //   required: true
    // }
      type: mongoose.Schema({
        product_id: { type: mongoose.Schema.Types.ObjectId },
        product_name: { type: String },
        business_name: { type: String },
        qty: { type: Number },
        price: { type: Number },
      }),
    },
  ],
});
var Cart = mongoose.model("Cart", cartSchema);

const validate = (Cart) => {
  const schema = {
    User: joi.string().required() ,
    Business:  joi.string().required(),
    products: joi.array().items(),
  };
  return joi.validate(Cart, schema)
}


module.exports = {Cart, validate}
