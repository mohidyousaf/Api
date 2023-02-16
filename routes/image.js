const express = require("express");
const { getFile } = require("../services/gfs-storage")

let router = express.Router();

//Create Order
router.post("/", async (req, res) => {
    try{
        const fileName = req.body.fileName
        const stream = await getFile(fileName)
        
    }catch(error){
        console.log({error})
    }
})