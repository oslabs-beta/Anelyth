import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';


dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.BUCKET_ACCESS_KEY;
const accessSecretKey = process.env.BUCKET_SECRET;  

// console.log(bucketName, bucketRegion, accessKey, accessSecretKey)

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: accessSecretKey
  },
  region: bucketRegion
});



const S3Controller = {};

S3Controller.upload = async (req, res, next) => {
  try{
    
    const params = {
      Bucket: bucketName,
      // need to configure the key to be the name of the file
      Key: res.locals.repoName + '.json',
      // need to configure the body to be the data from the file
      Body: file,
      ContentType: 'application/json'
    };
    
    // GET FILE FROM LOCAL STORAGE // 
    const file = fs.readFileSync('Server/Controllers/DCController.mjs');

    const command = new PutObjectCommand(params);
    await s3.send(command);
    return next();

  } catch (err) {
    return next({
      log: 'S3Controller.upload: ERROR: Error in S3Controller.upload',
      message: err,
    })
  }
}







export default S3Controller;
