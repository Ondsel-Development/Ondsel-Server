// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const agreementsPath = 'agreements'

export const agreementsMethods = ['create', 'find', 'get', 'patch']

export const agreementsClient = (client) => {
  const connection = client.get('connection')

  client.use(agreementsPath, connection.service(agreementsPath), {
    methods: agreementsMethods
  })
}
