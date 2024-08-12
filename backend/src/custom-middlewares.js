import axios from 'axios';
import { logger } from './logger.js';


function handleDownloadSharedModelFile(app) {
  app.use(
    '/shared-models/:id/download',
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const sharedModel = await app.service('shared-models').get(id);
        if (sharedModel.canDownloadDefaultModel) {
          const { url } = await app.service('upload').get(sharedModel.model.uniqueFileName);
          // Set appropriate headers for file download
          res.setHeader('Content-Disposition', `attachment; filename="${sharedModel.model.file.custFileName}"`);
          res.setHeader('Content-Type', 'application/octet-stream');
          // Stream the file directly to the client
          const response = await axios.get(url, { responseType: 'stream' });
          response.data.pipe(res);
        }
        res.status(500).json({ error: 'Not allowed to download a file' });
      } catch (e) {
        logger.error(e);
        next(e);
      }
    }
  )
}

export function registerCustomMiddlewares(app) {
  handleDownloadSharedModelFile(app);
}