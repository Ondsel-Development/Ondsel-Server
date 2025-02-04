// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import '@feathersjs/transport-commons'
import { logger } from './logger.js'

export const channels = (app) => {
  logger.warn(
    'Publishing all events to all authenticated users. See `channels.js` and https://dove.feathersjs.com/api/channels.html for more information.'
  )

  app.on('connection', (connection) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection)
  })

  app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection)
      const { user } = connection;

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection)
      app.channel(user._id.toString()).join(connection)

      app.service('workspaces').find({query: { $select: ['_id']}, user: user, paginate: false}).then(
        workspaces => app.channel(workspaces.map(workspace => `workspace/${workspace._id.toString()}`)).join(connection)
      );
      const organizations = user.organizations || [];
      organizations.map(
        organization => app.channel(`organization/${organization._id.toString()}`).join(connection)
      )
    }
  })

  // eslint-disable-next-line no-unused-vars
  // app.publish((data, context) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // e.g. to publish all service events to all authenticated users use
    // return app.channel('authenticated')
  // })
}
