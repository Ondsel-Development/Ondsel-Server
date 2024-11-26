// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const filePath = 'file'

export const fileMethods = ['find', 'get', 'create', 'patch', 'remove']

export const fileClient = (client) => {
  const connection = client.get('connection')

  client.use(filePath, connection.service(filePath), {
    methods: fileMethods
  })
}
