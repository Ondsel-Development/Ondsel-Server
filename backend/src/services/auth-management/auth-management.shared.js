// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const authManagementPath = 'auth-management'

export const authManagementMethods = ['find', 'get', 'create', 'patch', 'remove']

export const authManagementClient = (client) => {
  const connection = client.get('connection')

  client.use(authManagementPath, connection.service(authManagementPath), {
    methods: authManagementMethods
  })
}
