var mongoose = require("mongoose");
const joi = require("joi");
var orderSchema = mongoose.Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  NotifToken: String,
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
  time_of_order: Date,
  payable_amount: Number,
  delievery_time: String,
  delievery_location: String,
  status: {
    type: String,
    default: "In Approval",
  },
});
var Order = mongoose.model("Order", orderSchema);

const validate = (Order) => {
  const schema = {
    User: joi.string().required() ,
    NotifToken: joi.string().required() ,
    Business:  joi.string().required(),
    products: joi.array().items(),
    time_of_order: joi.date().iso(),
    payable_amount: joi.number(),
    delievery_time: joi.string(),
    delievery_location: joi.string(),
    status: joi.string(),
  };
  return joi.validate(Order, schema)
}


module.exports = {Order, validate}
