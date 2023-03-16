import AWS from 'aws-sdk';
import Store from 's3-blob-store';
import BlobService from 'feathers-blob';
import multer from 'multer';


class UploadService {
  constructor(options, blobService) {
    this.options = options;
    this.blobService = blobService;
  }

  async get(id, _params) {
    return await this.blobService.get(id, _params);
  }
  async create(data, params) {
    const d = await this.blobService.create(data, params);
    return d;
  }

  async remove(id, _params) {
    return await this.blobService.remove(id, _params)
  }
}

const getOptions = (app) => {
  return { app }
}

export const getUploadService = function(app){
  const s3 = new AWS.S3({
    accessKeyId: app.get('awsAccessKeyId'),
    secretAccessKey: app.get('awsSecretAccessKey')
  });

  const blobStore = Store({
    client: s3,
    bucket: app.get('awsClientModelBucket')
  });

  const blobUploadService = BlobService({
    Model: blobStore,
    returnUri: false,
  });

  return new UploadService(getOptions(app), blobUploadService);
}


export const multipartMiddleware = multer();