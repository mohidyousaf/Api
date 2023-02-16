const express = require("express");
const { Fav, validateFav } = require("../models/favourite");
let router = express.Router();

//Create Favourite
router.post("/", async (req, res) => {
  try {
    const { error } = validateFav(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let fav = new Fav(req.body);
    await fav.save();
    return res.send(fav);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//Get All Favourities
router.get("/", async (req, res) => {
  try {
    let favourities = await Fav.find().populate({
      path: "prod_id",
      select: "name price description rating",
    });
    if (favourities.length == 0)
      return res.status(404).send("No Favourities Found.");
    return res.send(favourities);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: err.message });
  }
});

//Update Favourite By ID
router.put("/:id", async (req, res) => {
  try {
    let fav = await Fav.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.status(200).send(fav);
  } catch (e) {
    return res.status(500).send(e);
  }
});
//Delete Favourite by ID
router.delete("/:id", async (req, res) => {
  try {
    let fav = await Fav.findByIdAndDelete(req.params.id);
    if (!fav) return res.status(404).send("No Favourite Found.");
    return res.status(200).send(fav);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
