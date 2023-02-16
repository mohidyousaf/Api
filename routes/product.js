const express = require("express");
const { Product, validate } = require("../models/product");
let router = express.Router();
const multer = require('multer')
// const {upload, getFile} = require ("../services/gfs-storage")
const { uploadFile } = require("../services/aws-s3")

var storage = multer.memoryStorage()
const upload= multer({
  storage: storage,
})

//Create Product
router.post("/", upload.array("img"), async (req, res) => {
  try {
    console.log({body: req.body, files: req.files})
    const { error } = validate(req.body);
    if ( error ) return res.status(400).send(error.details[0].message);
    let images = [], videos  = []
    const files =  req.files && Array.isArray(req.files) ? req.files:  []

    for (const file of files){
      let type = file.mimetype.split('/')[0]
      const data = await uploadFile(file)
      data &&  type === 'video' ? videos.push(data.Location): data && images.push(data.Location)
    }

    let product = new Product({
      ...req.body,
      images: images,
      videos: videos,
      price: parseInt(req.body.price)
    });
    // const image = await getFile(req.files[0].id)
    await product.save();
    return res.status(200).send(product)
  } catch (e) {
    console.log({e})
    return res.status(500).send(e);
  }
});

//get products
router.get("/", async (req, res) => {
  let products = await Product.find().lean();
  return res.send(products);
});

//Get a product By ID
router.get("/:id", async (req, res) => {
  try {
    let product = await Product.findOne({ _id: req.params.id });
    if (!product) return res.status(404).send("Product Not Found.");
    return res.status(200).send(product);
  } catch (e) {
    return res.status(500).send({ errorMessage: e.reason.message });
  }
});

//Update a product By ID
router.put("/:id", async (req, res) => {
  try {
    let product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.status(200).send(product);
  } catch (e) {
    res.status(500).send({ errorMessage: "Internal Server Error" });
  }
});

//Delete a product by ID
router.delete("/:id", async (req, res) => {
  let products = await Product.findByIdAndDelete(req.params.id);
  console.log(products, req.params.id);
  return res.status(200).send(products);
});

module.exports = router;
