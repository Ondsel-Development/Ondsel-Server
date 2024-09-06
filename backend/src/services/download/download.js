// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  downloadDataValidator,
  downloadPatchValidator,
  downloadQueryValidator,
  downloadResolver,
  downloadExternalResolver,
  downloadDataResolver,
  downloadPatchResolver,
  downloadQueryResolver,
  downloadSchema,
  downloadDataSchema,
  downloadPatchSchema,
  downloadQuerySchema,
} from './download.schema.js'
import { DownloadService, getOptions } from './download.class.js'
import { downloadPath, downloadMethods } from './download.shared.js'
import swagger from "feathers-swagger";
import {authenticate} from "@feathersjs/authentication";
import {generatePin} from "./helpers.js";

export * from './download.class.js'
export * from './download.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const download = (app) => {
  // Register our service on the Feathers application
  app.use(downloadPath, new DownloadService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: downloadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { downloadSchema, downloadDataSchema, downloadPatchSchema , downloadQuerySchema, },
      docs: {
        description: 'A download service to download file',
        idType: 'string',
        securities: ['all'],
      }
    })
  })

  // Need to define download file endpoint separately because I have to use express 'res' object which is
  // not possible with normal Download.get(id, params) function as it only allow to use id and params objects.
  // So, go with express middleware.
  app.use(
    '/download/file/:fileKey/:pin?',
    async (req, res, next) => {
      try {
        const { fileKey, pin } = req.params;
        const downloadService = app.service('download');
        const resp = await downloadService.find({ query: {
            fileKey: fileKey,
            ...(pin && { pin: pin}),
            ...(!pin && { pin: { $exists: false } })
          } });
        let downloadObj;
        if (resp.total) {
          downloadObj = resp.data[0];
        } else {
          res.status(404).json({ error: 'Object not found'});
          return
        }
        const currentTime = Date.now();
        if (downloadObj.expireAt && currentTime >= downloadObj.expireAt) {
          res.status(404).json({ error: 'Download is expired'});
          return
        }
        return await app.service(downloadPath).downloadFile(app, req, res, next);
      } catch (e) {
        res.status(404).json({ error: 'Object not found'});
      }
    }
  )

  // Initialize hooks
  app.service(downloadPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(downloadExternalResolver),
        schemaHooks.resolveResult(downloadResolver)
      ],
      create: [authenticate('jwt')],
    },
    before: {
      all: [
        schemaHooks.validateQuery(downloadQueryValidator),
        schemaHooks.resolveQuery(downloadQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        generatePin,
        schemaHooks.validateData(downloadDataValidator),
        schemaHooks.resolveData(downloadDataResolver),
      ],
      patch: [
        schemaHooks.validateData(downloadPatchValidator),
        schemaHooks.resolveData(downloadPatchResolver)
      ],
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