// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const sharedModelsPath = 'shared-models'

export const sharedModelsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const sharedModelsClient = (client) => {
  const connection = client.get('connection')

  client.use(sharedModelsPath, connection.service(sharedModelsPath), {
    methods: sharedModelsMethods
  })
}
