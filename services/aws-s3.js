const Aws = require('aws-sdk') 

// Now creating the S3 instance which will be used in uploading photo to s3 bucket.
const s3 = new Aws.S3({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,              // accessKeyId that is stored in .env file
    secretAccessKey:process.env.AWS_ACCESS_KEY_SECRET       // secretAccessKey is also store in .env file
  })

  const uploadFile = async( file ) => {
    const params = {
        Bucket:process.env.AWS_BUCKET_NAME,      // bucket that we made earlier
        Key: file.originalname,               // Name of the image
        Body: file.buffer,                    // Body which will contain the image in buffer format
        ACL:"public-read-write",                 // defining the permissions to get the public link
        ContentType: file.mimetype             // Necessary to define the image content-type to view the photo in the browser with the link
      }
    return await s3.upload(params).promise()
  }

  module.exports = {s3, uploadFile}