import AWS from 'aws-sdk'
import Store from 's3-blob-store'
import BlobService from 'feathers-blob'
import multer from 'multer'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

class UploadService {
  constructor(options, blobService, s3Client) {
    this.options = options;
    this.blobService = blobService;
    this.s3Client = s3Client;
  }

  async getSignedFileUrl(fileName, bucket, expiresIn) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileName,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async checkFileExists(bucketName, fileName) {
    try {
      const params = {
        Bucket: bucketName,
        Key: fileName
      };

      const command = new HeadObjectCommand(params);
      await this.s3Client.send(command);

      // The file exists
      return true;
    } catch (error) {
      if (error.$metadata.httpStatusCode === 404) {
        // The file does not exist
        return false;
      } else {
        // Handle other errors
        throw error;
      }
    }
  }

  async get(id, _params) {

    const bucketName = this.options.app.get('awsClientModelBucket');
    const isFileExist = await this.checkFileExists(bucketName, id);
    let url = '';
    if (isFileExist) {
      url = await this.getSignedFileUrl(id, bucketName, 3600);
    }
    return {url: url};
  }

  async create(data, params) {
    return await this.blobService.create(data, params);
  }

  async remove(id, _params) {
    return await this.blobService.remove(id, _params)
  }
}

const getOptions = (app) => {
  return { app }
}

export const getUploadService = function(app){

  const credentials = {
    accessKeyId: app.get('awsAccessKeyId'),
    secretAccessKey: app.get('awsSecretAccessKey'),
  }

  const s3 = new AWS.S3(credentials);

  const blobStore = Store({
    client: s3,
    bucket: app.get('awsClientModelBucket')
  });

  const blobUploadService = BlobService({
    Model: blobStore,
    returnUri: false,
  });

  const s3Client = new S3Client({
    credentials: credentials,
    region: app.get('awsRegion')
  });

  return new UploadService(getOptions(app), blobUploadService, s3Client);
}


export const multipartMiddleware = multer();
