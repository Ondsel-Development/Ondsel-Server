// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import { runnerLogsClient } from './services/runner-logs/runner-logs.shared.js'

import { accountEventClient } from './services/account-event/account-event.shared.js'

import { fileClient } from './services/file/file.shared.js'

import { sharedModelsClient } from './services/shared-models/shared-models.shared.js'

import { modelClient } from './services/models/models.shared.js'

import { uploadClient } from './services/upload/upload.shared.js'

import { userClient } from './services/users/users.shared.js'

/**
 * Returns a  client for the backend app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = (connection, authenticationOptions = {}) => {
  const client = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)

  client.configure(uploadClient)

  client.configure(modelClient)

  client.configure(sharedModelsClient)

  client.configure(fileClient)

  client.configure(accountEventClient)

  client.configure(runnerLogsClient)

  return client
}
