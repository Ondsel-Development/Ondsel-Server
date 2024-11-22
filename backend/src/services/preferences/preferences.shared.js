// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const preferencesPath = 'preferences'

export const preferencesMethods = ['find', 'get', 'create', 'patch', 'remove']

export const preferencesClient = (client) => {
  const connection = client.get('connection')

  client.use(preferencesPath, connection.service(preferencesPath), {
    methods: preferencesMethods
  })
}
