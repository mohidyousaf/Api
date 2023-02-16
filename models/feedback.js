var mongoose = require("mongoose");
var Joi = require("joi");

var feedback = mongoose.Schema({
  business_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  prod_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  comment: String,
  rating: Number,
});

var feedbacks = mongoose.model("feedback", feedback);

function validate(test) {
  const schema = Joi.alternatives().try(
    Joi.object().keys({
      business_id: Joi.string().allow(""),
      prod_id: Joi.string(),
      user_id: Joi.string(),
    }),
    Joi.object().keys({
      business_id: Joi.string(),
      prod_id: Joi.string().allow(""),
      user_id: Joi.string(),
    }),
    Joi.object().keys({
      business_id: Joi.string(),
      prod_id: Joi.string(),
      user_id: Joi.string().allow(""),
    })
  );
  return Joi.validate(test, schema);
}

module.exports.feedback = feedbacks;
module.exports.validate = validate;
