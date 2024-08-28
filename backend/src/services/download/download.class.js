import { MongoDBService } from '@feathersjs/mongodb'
import axios from 'axios';
import {logger} from "../../logger.js";

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class DownloadService extends MongoDBService {

  async downloadFile(app, req, res, next) {
    try {
      const { fileKey } = req.params;
      const decodedId = decodeURIComponent(fileKey);
      const r = await app.service('upload').get(decodedId);
      if (r.url) {
        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${decodedId}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        // Stream the file directly to the client
        const response = await axios.get(r.url, {responseType: 'stream'});
        response.data.pipe(res);
      }
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('download')),
  }
}
