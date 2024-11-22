// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const modelPath = 'models'

export const modelMethods = ['find', 'get', 'create', 'patch', 'remove']

export const modelClient = (client) => {
  const connection = client.get('connection')

  client.use(modelPath, connection.service(modelPath), {
    methods: modelMethods
  })
}
