import dauria from 'dauria';
import { authenticate } from '@feathersjs/authentication';

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
      events: []
    }
  )
  // Initialize hooks
  app.service(uploadPath).hooks({
    around: {
      all: [authenticate('jwt')],
    },
    before: {
      all: [
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
