// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const accountEventPath = 'account-event'

export const accountEventMethods = ['find', 'get', 'create']

export const accountEventClient = (client) => {
  const connection = client.get('connection')

  client.use(accountEventPath, connection.service(accountEventPath), {
    methods: accountEventMethods
  })
}
