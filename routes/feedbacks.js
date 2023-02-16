const express = require("express");
const { feedback } = require("../models/feedback");
let router = express.Router();

//Create Feedback
router.post("/", async (req, res, next) => {
  try {
    let feed = new feedback(req.body);
    await feed.save();
    return res.send(feed);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//Get All FeedBacks
router.get("/", async (req, res, next) => {
  try {
    let feed = await feedback.find();
    if (feed.length < 1) {
      return res.status(404).send({ message: "No feedback found" });
    }
    return res.status(200).send(feed);
  } catch (e) {
    return res.send({ message: e });
  }
});

//Get Feedback by ID
router.get("/:id/:check?", async (req, res) => {
  try {
    if (req.params.check == "bus") {
      let findfeed = await feedback.find({ business_id: req.params.id });
      if (findfeed.length < 1) {
        return res.status(404).send({ message: "No feedback" });
      }
      return res.send(findfeed);
    }
    if (req.params.check == "prod") {
      let findfeed = await feedback.find({ prod_id: req.params.id });
      if (findfeed.length < 1) {
        return res.status(404).send({ message: "No feedback" });
      }
      return res.send(findfeed);
    }

    let findfeed = await feedback.find({ user_id: req.params.id });
    if (findfeed.length < 1) {
      return res.status(400).send({ message: "No feedback" });
    }
    return res.send(findfeed);
  } catch (e) {
    return res.status(400).send(e);
  }
});

//Delete Feedback by ID
router.delete("/:id", async (req, res) => {
  let feedbacks = await feedback.findByIdAndDelete(req.params.id);

  return res.status(200).send(feedbacks);
});

module.exports = router;
