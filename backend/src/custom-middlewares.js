import axios from 'axios';
import { logger } from './logger.js';
import _ from 'lodash';
import { readFile } from 'fs/promises';
import path from 'path';


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
        } else {
          res.status(500).json({ error: 'Not allowed to download a file' });
        }
      } catch (e) {
        logger.error(e);
        next(e);
      }
    }
  )
}


function handleDownloadFile(app) {
  app.use(
    '/file/:id/download',
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const file = await app.service('file').get(id);
        const isOpen = _.get(file, 'workspace.open', false);
        if (isOpen) {
          const { url } = await app.service('upload').get(file.currentVersion.uniqueFileName);
          // Set appropriate headers for file download
          res.setHeader('Content-Disposition', `attachment; filename="${file.custFileName}"`);
          res.setHeader('Content-Type', 'application/octet-stream');
          // Stream the file directly to the client
          const response = await axios.get(url, { responseType: 'stream' });
          response.data.pipe(res);
        } else {
          res.status(500).json({ error: 'Not allowed to download a file' });
        }
      } catch (e) {
        logger.error(e);
        next(e);
      }
    }
  )
}


function handleStatusEndpoint(app) {
  app.use(
    '/status',
    async (req, res, next) => {
      const packageJsonPath = path.resolve('package.json');
      const data = await readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(data);
      const [majorVersion, minorVersion, patchVersion] = packageJson.version.split('.');
      res.json({
        version: {
          majorVersion: majorVersion,
          minorVersion: minorVersion,
          patchVersion: patchVersion,
        }
      })
    }
  )
}

export function registerCustomMiddlewares(app) {
  handleDownloadSharedModelFile(app);
  handleDownloadFile(app);
  handleStatusEndpoint(app);
}