import AWS from 'aws-sdk';
import Store from 's3-blob-store';
import BlobService from 'feathers-blob';
import multer from 'multer';


export const getUploadService = function(app){
  const s3 = new AWS.S3({
    accessKeyId: app.get('awsAccessKeyId'),
    secretAccessKey: app.get('awsSecretAccessKey')
  });

  const blobStore = Store({
    client: s3,
    bucket: app.get('awsClientModelBucket')
  });

  return BlobService({
    Model: blobStore,
    // returnUri: false,
  });

}


export const multipartMiddleware = multer();