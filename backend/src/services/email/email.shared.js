// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const emailPath = 'email'

export const emailMethods = ['find', 'get', 'create', 'patch', 'remove']

export const emailClient = (client) => {
  const connection = client.get('connection')

  client.use(emailPath, connection.service(emailPath), {
    methods: emailMethods
  })
}
