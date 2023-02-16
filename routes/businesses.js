const express = require("express");
const { Businesses } = require("../models/business");
const { Product } = require("../models/product");
const _ = require("lodash");
let router = express.Router();

const multer = require('multer')
// const {upload, getFile} = require ("../services/gfs-storage")
const { uploadFile } = require("../services/aws-s3")

var storage = multer.memoryStorage()
const upload= multer({
  storage: storage,
})

//Create Business
router.post("/" , upload.array("img"),  async (req, res) => {
  const body = req.body;
  console.log({body: body, files: req.files})

  let images = [], videos  = []
  const files =  req.files && Array.isArray(req.files) ? req.files:  []

    for (const file of files){
      let type = file.mimetype.split('/')[0]
      const data = await uploadFile(file)
      data &&  type === 'video' ? videos.push(data.Location): data && images.push(data.Location)
    }

    let business = new Businesses({
      ...req.body,
      image: images[0],
      latitude: parseFloat(body?.latitude),
      longitude: parseFloat(body?.longitude),
      location: {
        "coordinates": [parseFloat(body?.latitude), parseFloat(body?.longitude)]
      }
    });
    
  await business.save();
  return res.send(business);
});

// find business in Area
router.post("/byArea", async (req, res) => {
  let lat = req.body.lat;
  let lang = req.body.lng;

  try {
    let businesses = await Businesses.find({
      location: {
        $near: {
          $maxDistance: 3000,
          $geometry: {
            type: "Point",
            coordinates: [ lat, lang ]
          }
        }
      }
    });

    res.status(200).send(businesses);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

//Get All businesses
router.get("/", async (req, res) => {
  let businesses = await Businesses.find();

  return res.send(businesses);
});

//Get All businesses of a User
router.get("/list/:id", async (req, res) => {
  try {
    let businesses = await Businesses.find({ user: req.params.id });
    if (businesses.length == 0) return res.status(404).send("Not Found!");
    return res.status(200).send(businesses);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//Get a business by ID
router.get("/:id", async (req, res) => {
  try {
    let Business = await Businesses.findById(req.params.id);

    return res.send(Business);
  } catch (e) {
    return res.send({ errormessage: "No Business found" });
  }
});

//Get All products of a business
router.get("/listProducts/:id", async (req, res) => {
  const products = await Product.find({ business_id: req.params.id });
  if (products.length == 0) return res.status(404).send("Not Found!");
  return res.status(200).send(products);
});
//Update a business by ID
router.put("/:id", async (req, res) => {
  try {
    let Business = await Businesses.findOneAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.status(200).send(Business);
  } catch (e) {
    return res.send({ errormessage: "no record found" });
  }
});

//Delete a business by ID
router.delete("/:id", async (req, res) => {
  try {
    let Business = await Businesses.findByIdAndDelete(req.params.id);

    return res.status(200).send(Business);
  } catch (e) {
    return res.send({ errormessage: "no record found" });
  }
});

module.exports = router;
