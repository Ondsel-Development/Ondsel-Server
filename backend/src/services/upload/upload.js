// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import dauria from 'dauria';
import { authenticate } from '@feathersjs/authentication';
import { iff } from 'feathers-hooks-common';

import { getUploadService, multipartMiddleware } from './upload.class.js'
import { uploadPath, uploadMethods } from './upload.shared.js'

export * from './upload.class.js'

// A configure function that registers the service and its hooks via `app.configure`
export const upload = (app) => {
  // Register our service on the Feathers application
  app.use(
    uploadPath,
    multipartMiddleware.single('file'),
    function(req, res, next) {
      req.feathers.file = req.file;
      next();
    },
    getUploadService(app),
    {
      // A list of all methods this service exposes externally
      methods: uploadMethods,
      // You can add additional custom events to be sent to clients here
      events: [],
      docs: {
        description: 'A service to upload a file',
        schemas: {
          Upload: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'file name'
              },
              size: {
                type: 'integer',
                description: 'Size of upload file'
              },
              contentType: {
                type: 'string',
                description: 'File content type'
              }

            },
          },
        },
        model: 'Upload',
        tag: 'Upload',
        idType: 'string',
        securities: ['all'],
        operations: {
          find: false,
          update: false,
          remove: false,
          patch: false,
          get: {
            "parameters": [
              {
                "description": "ID of Upload to return",
                "in": "path",
                "name": "id",
                "schema": {
                  "type": "string"
                },
                "required": true,
              },
              {
                "description": "Pass \"true\" to get file content string",
                "in": "query",
                "name": "fileContent",
                "schema": {
                  "type": "string"
                },
                "required": false,
              },
            ],
          },
          create: {
            description: 'Upload file',
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema:
                  {
                    type: 'object',
                    properties: {
                      file: {
                          type: 'string',
                          format: 'binary',
                          description: 'File name should be unique (uuid4)'
                      }
                    },
                  },
                },
              },
            },
          },
        },
      }
    }
  )
  // Initialize hooks
  app.service(uploadPath).hooks({
    around: {
      all: [],
    },
    before: {
      all: [
        iff (
          context => context.params.query?.modelId,
          iff (
            async (context) => {
              const modelId = context.params.query?.modelId
              const model = await context.app.service('models').get(modelId);
              return !model.isSharedModel
            },
            authenticate('jwt'),
          ),
        ).else (
          authenticate('jwt'),
        ),
      ],
      find: [],
      get: [],
      create: [
        function(context) {
          if (!context.data.uri && context.params.file){
            const file = context.params.file;
            const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
            if (context.data.id) {
              context.data = {
                uri: uri,
                id: context.data.id
              }
            } else {
              context.data = {uri: uri, id: context.params.file.originalname};
            }
          }
        },
      ],
      patch: [],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
