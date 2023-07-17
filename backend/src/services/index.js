import { file } from './file/file.js'

import { sharedModels } from './shared-models/shared-models.js'

import { model } from './models/models.js'

import { upload } from './upload/upload.js'

import { user } from './users/users.js'

export const services = (app) => {
  app.configure(file)

  app.configure(sharedModels)

  app.configure(model)

  app.configure(upload)

  app.configure(user)

  // All services will be registered here
}
