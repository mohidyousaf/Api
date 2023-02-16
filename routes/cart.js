const express = require("express");
const { Cart, validate } = require("../models/cart");
const { Product } = require("../models/product");
const { Businesses } = require("../models/business");

let router = express.Router();

//Create Cart
router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body)
        console.log({ error })
        if (error) return res.status(400).send(error.details[0].message);

        let cart = new Cart({
            ...req.body,
        });
        console.log({ cart })
        cart = await cart.save().then(
            t => t.populate({
                path: "product_id",
                select: "name price description rating",
            })
        );
        return res.status(200).send({
            message: "Cart created Successfully",
            cart: cart,
        });
    } catch (e) {
        return res.status(500).send(e);
    }
});

//Update cart By ID
router.put("/:id", async (req, res) => {
    try {
        // let cart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        // });
        console.log({product: req.body.products[0]})
        let cart = await Cart.findOneAndUpdate(
            { _id: req.params.id }, 
            { $push: { products: req.body.products[0] } }
          );
        return res.status(200).send(cart);
    } catch (e) {
        return res.status(500).send(e);
    }
});

module.exports =  router 

