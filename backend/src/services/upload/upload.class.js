import AWS from 'aws-sdk'
import Store from 's3-blob-store'
import BlobService from 'feathers-blob'
import multer from 'multer'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, S3Client, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3'
import { BadRequest } from '@feathersjs/errors'

const customerFileNameRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.([a-z]+)$/i;
const generatedObjRegex = /^[0-9a-fA-F]{24}_generated\.(:?OBJ|BREP|FCSTD)$/;
const generatedThumbnailRegex = /^[0-9a-fA-F]{24}_thumbnail\.PNG$/;
const copiedVersionThumbnailRegex = /^[0-9a-fA-F]{24}_[0-9a-fA-F]{24}_versionthumbnail\.PNG$/;
const exportedFileRegex = /^[0-9a-fA-F]{24}_export\.(?:fcstd|obj|step|stl)$/i;

const isValidFileName = fileName => {
  return [
    customerFileNameRegex, generatedObjRegex, generatedThumbnailRegex, copiedVersionThumbnailRegex, exportedFileRegex
  ].some(regex => regex.test(fileName))
}

class UploadService {
  constructor(options, blobService, s3Client) {
    this.options = options;
    this.blobService = blobService;
    this.s3Client = s3Client;
  }

  getPublicUrl(fileName, bucket) {
    return `https://${this.options.app.get('awsClientModelBucket')}.s3.amazonaws.com/${fileName}`;
  }

  async getSignedFileUrl(fileName, bucket, expiresIn) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileName,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getFileContent(bucketName, fileName) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    const { Body } = await this.s3Client.send(command)
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const fileContent = Buffer.concat(chunks).toString('utf-8');
    return fileContent
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
    id = decodeURIComponent(id);
    const bucketName = this.options.app.get('awsClientModelBucket');
    const isFileExist = await this.checkFileExists(bucketName, id);

    let url = '';
    if (isFileExist) {
      if (_params.query?.fileContent === 'true') {
        return this.getFileContent(bucketName, id);
      }
      if (id.includes('public/')) {
        url = this.getPublicUrl(id, bucketName);
      } else if (id.includes('thirdpartyshare')) {
        return this.getThirdPartyShare(id, bucketName); // TODO
      } else {
        url = await this.getSignedFileUrl(id, bucketName, 3600);
      }
    }
    return { url: url };
  }

  async create(data, params) {
    if (!isValidFileName(data['id'])) {
      throw new BadRequest('Filename not valid!')
    }

    if (customerFileNameRegex.test(data['id'])) {
      const bucketName = this.options.app.get('awsClientModelBucket');
      const isFileExist = await this.checkFileExists(bucketName, data['id']);
      if (isFileExist) {
        throw new BadRequest('File already exists!');
      }
    }

    // Upload all thumbnails to public folder
    if (generatedThumbnailRegex.test(data['id'])) {
      data.id = `public/${data.id}`;
    }

    return await this.blobService.create(data, params);
  }

  async remove(id, _params) {
    return await this.blobService.remove(id, _params)
  }

  async copy(sourceKey, destinationKey, _params) {
    const bucketName = this.options.app.get('awsClientModelBucket');
    const isDestinationFileExist = await this.checkFileExists(bucketName, destinationKey);
    if (isDestinationFileExist) {
      throw new BadRequest(`File (${destinationKey}) already exists!`);
    }

    const isSourceFileExist = await this.checkFileExists(bucketName, sourceKey);
    if (!isSourceFileExist) {
      throw new BadRequest(`File (${sourceKey}) does not exist!`);
    }

    // Create a copy operation using the CopyObjectCommand
    const copyCommand = new CopyObjectCommand({
      CopySource: `/${bucketName}/${sourceKey}`,
      Bucket: bucketName,
      Key: destinationKey,
    });

    return await this.s3Client.send(copyCommand);
  }

  async upsert(sourceKey, destinationKey, _params) {
    const bucketName = this.options.app.get('awsClientModelBucket');
    const isSourceFileExist = await this.checkFileExists(bucketName, sourceKey);
    if (!isSourceFileExist) {
      throw new BadRequest(`File (${sourceKey}) does not exist!`);
    }

    // const isDestinationFileExist = await this.checkFileExists(bucketName, destinationKey);
    // if (isDestinationFileExist) {
    // }

    // Create a copy operation using the CopyObjectCommand
    const copyCommand = new CopyObjectCommand({
      CopySource: `/${bucketName}/${sourceKey}`,
      Bucket: bucketName,
      Key: destinationKey,
    });

    return await this.s3Client.send(copyCommand);
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
