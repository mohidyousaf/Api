var express = require("express");
const { User, validate, validateUpdate } = require("../models/user");
const auth = require("../middleware/auth");
const _ = require("lodash");
const bcrypt = require("bcrypt");
var router = express.Router();

//User Login
router.post("/login", async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
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
    //role: user.role,
    //refferal_code: user.refferal_code,
    //isMember: user.isMember,
  };

  const reponse = {
    token,
    user: userObj,
  };
  return res.send(reponse);
});

//Create User
router.post("/", async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let lowerEmail = req.body.email.toLowerCase();
    let user = await User.findOne({ email: lowerEmail });
    if (user) return res.status(400).send("User alredy registered");

    user = new User(
      _.pick(req.body, [
        "name",
        "email",
        "number",
        "password",
        "location",
        "locationDesc",
      ])
    );
    user.set({ email: lowerEmail });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    await user.save();
    return res.status(200).send(user);
  } catch (e) {
    return res.status(500).send(e);
  }
});
//Update User by ID
router.put("/", [auth], async (req, res, next) => {
  try {
    const { error } = validateUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let users = await User.findOneAndUpdate(
      { _id: req.user._id },
      _.pick(req.body, ["name", "email", "number", "location", "locationDesc"]),
      { new: true }
    );
    if (!users) {
      return res.status(400).send({ message: "No user found to Update" });
    }
    // users[req.body.name] = req.body.value;
    // await users.save();
    return res.status(200).send(users);
  } catch (e) {
    return res.send(e);
  }
});

//Change blocked status of a User by ID
router.put("/blockUser/:id", async (req, res, next) => {
  try {
    let user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).send({ message: "No user found to Update" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    // users[req.body.name] = req.body.value;
    // await users.save();
    return res.status(200).send(user);
  } catch (e) {
    return res.send(e);
  }
});

//Read Single User By ID
router.get("/:id", async (req, res, next) => {
  try {
    let user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }
    return res.status(200).send(user);
  } catch (e) {
    return res.send(e);
  }
});
//Read All Users
router.get("/", async (req, res, next) => {
  try {
    let users = await User.find();
    if (!users) {
      return res.status(400).send({ message: "No user found" });
    }
    return res.status(200).send(users);
  } catch (e) {
    return res.send(e);
  }
});

//Delete a user by Id
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);

    if (!user)
      return res.status(404).send("The user with given id was not found...");
    res.send(user);
  } catch (e) {
    return res.send(e);
  }
});
module.exports = router;
