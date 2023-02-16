const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const config = require("config");
const app = express();  
const fs = require("fs");

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

let GridFSBucket
//creating bucket
mongoose.connection.on("connected", () => {
    let db = mongoose.connections[0].db;
    GridFSBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "newBucket"
    });
  });

// Create mongo connection
const conn = mongoose.createConnection(config.get("dbUri"));

// Init gfs
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);  
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: config.get("dbUri"),
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
    });
  }
});

const getFile = async (id) => {
    try {   
        let image_buf = [];
        const file = await gfs.files.findOne({ _id : mongoose.Types.ObjectId(id) });
        await new Promise(async(resolve, reject) => {
            readStream = await gfs.createReadStream(file.filename);
            readStream.on('error', err => reject(err));
            readStream.on('data', chunk => image_buf.push(chunk));
            readStream.on('end', () => resolve(image_buf = Buffer.concat(image_buf)));
        })
        // fs.writeFile("video.mov", image_buf, (err) => {
        //     if (err) throw err;
        //     console.log("The file has been saved!");
        //   });
        // console.log({image_buf})
        return image_buf
    } catch (error) {
        console.log({error})
    }
}

const upload = multer({ storage})

module.exports = {upload, getFile}