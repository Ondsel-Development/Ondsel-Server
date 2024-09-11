import axios from 'axios';
import { logger } from './logger.js';
import _ from 'lodash';
import { readFile } from 'fs/promises';
import path from 'path';
import {
  createUserEngagementEntryForPublisherDownload
} from "./services/hooks/userEngagements.js";

function rot13rot5(str) {
  // ========== from chatGPT:
  return str.replace(/[A-Za-z0-9]/g, function(c) {
    if (/[A-Za-z]/.test(c)) {
      return String.fromCharCode(c.charCodeAt(0) + (c.toUpperCase() <= 'M' ? 13 : -13));
    } else if (/[0-9]/.test(c)) {
      return String.fromCharCode((c.charCodeAt(0) - 48 + 5) % 10 + 48);
    }
  });
}

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

function handlePublishedFileDownload(app) {
  const thisPath = '/publisher/:id/download/:filename';
  app.post(
    thisPath,
    // authenticate('jwt'),
    async (req, res, next) => {
      const { id } = req.params;
      let publishedDetails;
      try {
        publishedDetails = await app.service('publisher').get(id);
      } catch (e) {
        res.sendStatus(404);
      }
      try {
        if (!req.body.hasOwnProperty('downloadCounter')) {
          return res.status(401).json({ msg: 'authorization denied' });
        }
        const enc = req.body['downloadCounter'];
        const uid = rot13rot5(enc);
        await createUserEngagementEntryForPublisherDownload(publishedDetails, uid, app);
        const { url } = await app.service('upload').get(publishedDetails.uploadedUniqueFilename);

        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${publishedDetails.filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        // Stream the file directly to the client
        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(res);
      } catch (e) {
        logger.error(e);
        next(e);
      }
    },
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
  handlePublishedFileDownload(app);
  handleStatusEndpoint(app);
}

