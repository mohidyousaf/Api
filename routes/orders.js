const express = require("express");
const { Order, validate } = require("../models/orders");
const { Product } = require("../models/product");
const { Businesses } = require("../models/business");
const pushNotificationController= require('../controllers/push-notification.controller')

let router = express.Router();

//Create Order
router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body)
    console.log({error}) 
    if (error) return res.status(400).send(error.details[0].message);
    const products = req.body.products;
    var orderTotal = 0;
    var totalShipment = 0;
    for (let i = 0; i < products.length; i++) {
      let product = await Product.findById(products[i].product_id);
      if(product){
        orderTotal += product.price * products[i].qty;
        products[i].price = product?.price || null;
        products[i].product_name = product?.name || null;
        let business = await Businesses.findById(product.business_id);
        totalShipment += business?.delivery_charges ? business.delivery_charges : 0;
        products[i].business_name = business?.name || null;
      }
    }
    let order = new Order({
      ...req.body,
      products: products,
      time_of_order: Date.now(),
      payable_amount: orderTotal + totalShipment,
      // delievery_time: String,
      //delievery_location: String,
    });
    console.log({order})
    order = await order.save();
    pushNotificationController.sendSpecificNotificationBasedOnOrderStatus(req.body.NotifToken, "In Approval")
    return res.status(200).send({
      message: "Order created Successfully",
      Order: order,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});

//Get All Order
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders) return res.status(404).send("Not Found!");
    return res.status(200).send(orders);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// get orders of specific user
router.get("/user/:id", async(req,resp)=> {
  try{
    const findorder = await Order.find({"User": req.params.id})
    if (findorder.length < 1) {
      return resp.status(402).send("error");
    }
    return resp.send(findorder);
  }catch(error){
    return resp.status(400).send("error");
  }
})

// get order of specific business with specific status
router.get("/business/:id/:status", async(req, resp) => {
  try{
    const findorder = await Order.find({"User": req.params.id, "status": req.params.status}).populate({
      path: "User",
      select: "name"
    });
    if (findorder.length < 1) {
      return resp.status(402).send("error");
    }
    return resp.send(findorder);
  }catch(error){
    console.log({error});
    return resp.status(400).send("error");
  }
})

//get products
router.get("/:id/:check?", async (req, res) => {
  try {
    if (req.params.check == "true") {
      let findorder = await Order.find({ "UserId.createdby": req.params.id });
      if (findorder.length < 1) {
        return res.status(402).send("error");
      }
      return res.send(findorder);
    }

    let orders = await Order.findById(req.params.id);
    if (!orders) {
      return res.status(400).send("error");
    }
    return res.send(orders);
  } catch (e) {
    return res.status(400).send("error");
  }
});

router.put("/:id", async (req, res) => {
  let order = await Order.findByIdAndUpdate(
    {
      "_id": req.params.id,
    },
    { $set: { "status": req.body.status } }
  );
  console.log({status: req.body.status})
  pushNotificationController.sendSpecificNotificationBasedOnOrderStatus(order.NotifToken, req.body.status)

  return res.send(order);
});
//Delete Order by ID
router.delete("/:id", async (req, res) => {
  let ordersdelete = await Order.findByIdAndRemove(req.params.id);
  if (!ordersdelete)
    return res.status(404).send("The Order with given id was not found...");
  res.send(ordersdelete);
});
//postproducts
router.post("/:id", async (req, res) => {
  let findorder = await Order.findById(req.params.id);
  if (!findorder) {
    let orders = new Order();
    orders._id = req.params.id;
    orders.UserId = req.body;
    await orders.save();
    return res.send(orders);
  } else {
    findorder.UserId.push(req.body);
    await findorder.save();
    return res.send(findorder);
  }
});

module.exports = router;
