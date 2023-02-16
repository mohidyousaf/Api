//const winston = require("winston");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const { OTP, validateOtpReq } = require("../models/OTP");
const auth = require("../middleware/auth");
const { membershipEmail, otpMail } = require("./mail");
const { mailWhitelist } = require("./helper");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const config = require("config");
const stripe = require("stripe")(config.get("stkey"));
var otpGenerator = require("otp-generator");

//User Login
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //return res.send('ok')
  let lowerEmail = req.body.email.toLowerCase();
  let user = await User.findOne({ email: lowerEmail });
  if (!user) return res.status(400).send("Invalid email or password");
  // const createdAt = new mongoose.Types.ObjectId(user._id).getTimestamp()
  // console.log(createdAt)
  // return
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isValidPassword)
    return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();

  const userObj = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    refferal_code: user.refferal_code,
    isMember: user.isMember,
  };

  const reponse = {
    token,
    user: userObj,
  };
  return res.send(reponse);

  // const userObj = {
  //   id: user.id,
  //   name: user.name,
  //   email: user.email,
  //   role: user.role,
  //   isMember: user.isMember,
  // };

  // const reponse = {
  //   token,
  //   user: userObj,
  // };
  // return res.send(reponse);
});

router.post("/generateOtp", async (req, res) => {
  try {
    //Validating request body for generate OTP
    const { error } = validateOtpReq(req.body);
    if (error) res.status(400).send(error.details[0].message);

    //Finding the existing user in the Db against the email provided in request body
    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .send("No user exists against the provided email ID.");

    //extracting the user's OTP document for DB
    // let userOTP = await OTP.findOne({ user: user._id })
    //if (!userOTP) return res.status(400).send('No OTP document found in the db against the user')
    //Generating OTP
    let otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      digits: true,
      alphabets: false,
    });

    //setting the otp field in user's OTP document
    // userOTP.set({
    //     otp: otp,
    //     expired: false
    // })

    let userOtp = await OTP.updateOne(
      { user: user._id },
      {
        $set: {
          otp: otp,
          expired: false,
        },
      },
      { upsert: true }
    );

    await otpMail(user.email, otp, user.name);
    res.send(user);
  } catch (err) {
    // require("log-timestamp");
    winston.log("error", err.stack);
    console.error(err);
  }
});

//Verify Email
router.post("/generateOtp", async (req, res) => {
  try {
    //Validating request body for generate OTP
    const { error } = validateOtpReq(req.body);
    if (error) res.status(400).send(error.details[0].message);

    //Finding the existing user in the Db against the email provided in request body
    let lowerEmail = req.body.email.toLowerCase();
    let user = await User.findOne({ email: lowerEmail });
    if (!user)
      return res
        .status(400)
        .send("No user exists against the provided email ID.");

    //extracting the user's OTP document for DB
    // let userOTP = await OTP.findOne({ user: user._id })
    //if (!userOTP) return res.status(400).send('No OTP document found in the db against the user')
    //Generating OTP
    let otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      digits: true,
      alphabets: false,
    });

    //setting the otp field in user's OTP document
    // userOTP.set({
    //     otp: otp,
    //     expired: false
    // })

    let userOtp = await OTP.updateOne(
      { user: user._id },
      {
        $set: {
          otp: otp,
          expired: false,
        },
      },
      { upsert: true }
    );

    await otpMail(user.email, otp, user.name);
    res.send(user);
  } catch (err) {
    console.log(err);
  }
});

//Verify Email
router.post("/verifyOtp", async (req, res) => {
  const { error } = validateVerifyOtpBody(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let user = await User.findOne({ _id: req.body.userId });
    if (!user)
      return res.status(400).send("No user exists against the provided ID.");

    const userOtp = await OTP.findOne({ user: req.body.userId });

    if (userOtp.otp === req.body.otp && userOtp.expired != true) {
      user.verified = true;
      userOtp.expired = true;
      await user.save();
      await userOtp.save();
      const token = user.generateAuthToken();

      const userObj = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        refferal_code: user.refferal_code,
        isMember: user.isMember,
      };

      const reponse = {
        token,
        user: userObj,
      };
      return res.send(reponse);
    } else {
      if (userOtp.otp != req.body.otp) {
        return res.status(400).send("Invalid OTP. ");
      }
      return res.status(400).send("Expired OTP. ");
    }
  } catch (err) {
    winston.log("error", err.stack);
    // require("log-timestamp");
    // console.error(err);
  }
});

//Membership Subscription
router.post("/isMember", [auth], async (req, res) => {
  // const { error } = validate(req.body)
  // if (error) return res.status(400).send(error.details[0].message)

  let user = await User.findById(req.user._id);

  if (!user) {
    console.log("Thats the problem: ", req.user._id);
    return res.status(400).send("Invalid User Id");
  }
  stripe.charges
    .create({
      amount: 2000,
      source: req.body.stripeTokenId,
      currency: "usd",
    })
    .then(async function (charge) {
      user = await User.findById(req.user._id);
      user.set({
        isMember: true,
        charge_id: charge.id,
      });
      user = await user.save();
      const token = user.generateAuthToken();

      const userObj = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        refferal_code: user.refferal_code,
        isMember: user.isMember,
      };

      const response = {
        token,
        user: userObj,
      };
      await membershipEmail(user.email, user.name);
      console.log("Charge Successful");
      await mailWhitelist(user.email);
      return res.send(response);
    })
    .catch(function (error) {
      console.log("Charge Failed");
      console.log(error.raw.code);
      if (error.raw.code == "token_already_used") {
        return res.status("304").end();
      } else {
        return res.status(500).end();
      }
    });
  // .then(async function (charge) {
  //   user = await User.findById(req.user._id);
  //   user.set({
  //     isMember: true,
  //     charge_id: charge.id,
  //   });
  //   user = await user.save();
  //   const token = user.generateAuthToken();

  //   const userObj = {
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     role: user.role,
  //     refferal_code: user.refferal_code,
  //     isMember: user.isMember,
  //   };

  //   const response = {
  //     token,
  //     user: userObj,
  //   };
  //   await membershipEmail(user.email, user.name);
  //   console.log("Charge Successful");
  //   await mailWhitelist(user.email);
  //   return res.send(response);
  // })
  // .catch(function (error) {
  //   if (error.raw.code == "token_already_used") {
  //     return res.status("304").end();
  //   } else {
  //     return res.status(500).end();
  //   }
  // });
});

//Membership Subscription through Crypto Currency
router.post("/isMemberUrl", [auth], async (req, res) => {
  const { error } = validateUrl(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findById(req.user._id);
  if (!user) return res.status(400).send("Invalid User Id");

  user = await User.findById(req.user._id);
  user.set({
    isMember: true,
    blockchain_Url: req.body.url,
  });
  user = await user.save();
  await membershipEmail(user.email, user.name);
  const token = user.generateAuthToken();

  const userObj = {
    id: user.id,
    name: user.name,
    email: user.email,
    refferal_code: user.refferal_code,
    role: user.role,
    isMember: user.isMember,
  };

  const response = {
    token,
    user: userObj,
  };
  return res.send(response);
});

function validateUrl(url) {
  const schema = {
    url: Joi.string().required(),
  };
  return Joi.validate(url, schema);
}

function validate(user) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    isOtp: Joi.boolean().required(),
    otp: Joi.string().max(6).allow("", null),
  };
  return Joi.validate(user, schema);
}

function validateVerifyOtpBody(otp) {
  const schema = {
    userId: Joi.string().required(),
    otp: Joi.string().required(),
  };
  return Joi.validate(otp, schema);
}
module.exports = router;
