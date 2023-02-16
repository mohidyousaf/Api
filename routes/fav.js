const express = require("express");
const { UserFav } = require("../models/fav");
let router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    let fav = await UserFav.findOne({ Uid: req.params.id });
    if (fav) {
      return res.send(fav);
    }
    return res.status(400).send({ Error: "Not found" });
  } catch (e) {
    return res.status(400).send({ Error: "Not found" });
  }
});

router.post("/:id", async (req, res) => {
  try {
    let findfav = await UserFav.findOne({ Uid: req.params.id });

    if (!findfav) {
      let fav = new UserFav();
      fav.Uid = req.params.id;
      fav.Fav = req.body;
      await fav.save();
      return res.send(fav);
    } else {
      let findfavs = await UserFav.findOne({ "Fav.id": req.body.id });
      if (findfavs) {
        let fav = await UserFav.findOneAndUpdate(
          {
            "Fav.id": req.body.id,
          },
          { $set: { "Fav.$.status": req.body.status } }
        );
        return res.send(fav);
      } else {
        findfav.Fav.push(req.body);
        await findfav.save();
        return res.send(findfav);
      }
    }
  } catch (e) {
    return res.send(e);
  }
});
module.exports = router;
