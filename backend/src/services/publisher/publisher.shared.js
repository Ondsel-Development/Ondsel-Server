// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const publisherPath = 'publisher'

export const publisherMethods = ['find', 'create', 'remove']

export const publisherClient = (client) => {
  const connection = client.get('connection')

  client.use(publisherPath, connection.service(publisherPath), {
    methods: publisherMethods
  })
}
