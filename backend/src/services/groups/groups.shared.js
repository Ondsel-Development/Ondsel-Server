// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const groupPath = 'groups'

export const groupMethods = ['find', 'get', 'create', 'patch', 'remove']

export const groupClient = (client) => {
  const connection = client.get('connection')

  client.use(groupPath, connection.service(groupPath), {
    methods: groupMethods
  })
}
