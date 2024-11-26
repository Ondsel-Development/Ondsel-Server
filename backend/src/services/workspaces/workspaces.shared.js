// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const workspacePath = 'workspaces'

export const workspaceMethods = ['find', 'get', 'create', 'patch', 'remove']

export const workspaceClient = (client) => {
  const connection = client.get('connection')

  client.use(workspacePath, connection.service(workspacePath), {
    methods: workspaceMethods
  })
}
