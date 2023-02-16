const xmlparser = require("express-xml-bodyparser");
const express = require("express");
const cors = require("cors");
const users = require("../routes/users");
const products = require("../routes/product");
const businesses = require("../routes/businesses");
const feedbacks = require("../routes/feedbacks");
const orders = require("../routes/orders");
const fav = require("../routes/favourites");
const notification= require('../routes/notification')
const cart = require('../routes/cart')
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const multipart = require('connect-multiparty');


module.exports = function (app) {
  app.use(xmlparser());
  // app.use(multipart());
  app.use(express.json());       
  app.use(express.urlencoded({extended: true})); 

  // app.use(cors());
  // app.options("*", cors());

  // const corsOption = {
  //   origin: ['http://localhost:3000'],
  // };
  // app.use(cors(corsOption));
  app.use("/api/users", users);
  app.use("/api/businesses", businesses);
  app.use("/api/products", products);
  app.use("/api/feedbacks", feedbacks);
  app.use("/api/orders", orders);
  app.use("/api/fav", fav);
  app.use('/api/notification',notification)
  app.use('/api/cart', cart)
  //app.use('/api/dealCustomers', dealCustomers)
  //app.use('/api/test', test)
};
