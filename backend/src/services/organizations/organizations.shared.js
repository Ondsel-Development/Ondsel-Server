// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const organizationPath = 'organizations'

export const organizationMethods = ['find', 'get', 'create', 'patch', 'remove']

export const organizationClient = (client) => {
  const connection = client.get('connection')

  client.use(organizationPath, connection.service(organizationPath), {
    methods: organizationMethods
  })
}
