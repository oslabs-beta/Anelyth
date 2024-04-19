import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { json } from 'd3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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
    // Read the file content
    const filePath = path.resolve(__dirname, '../../../super-structure.log');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonObj = JSON.parse(fileContent);
    const file = JSON.stringify(JSON.parse(fileContent));

    //setting up S3 upload parameters
    const params = {
      Bucket: bucketName,
      // need to configure the key to be the name of the file
      Key: jsonObj.name,
      // need to configure the body to be the data from the file
      Body: file,
      ContentType: 'application/json'
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);
    return next();

  } catch (err) {
    return next({
      log: 'S3Controller.upload: ERROR: Error in S3Controller.upload' + err,
      message: err,
    })
  }
}

S3Controller.getBucketItems = async (req, res, next) => {
  // need to get this from the front end when clicking on the repo i want to pull up
  const bucketKey = res.locals.bucketKey;

  // so this wont work till we get the bucket key from the front end
  const params = {
    Bucket: bucketName,
    Key: bucketKey
  };

  const command = new GetObjectCommand(params);
  const data = await s3.send(command);
  console.log(data)

  return next();
};








export default S3Controller;
