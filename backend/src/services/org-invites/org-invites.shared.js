// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const orgInvitesPath = 'org-invites'

export const orgInvitesMethods = ['get', 'create', 'patch']

export const orgInvitesClient = (client) => {
  const connection = client.get('connection')

  client.use(orgInvitesPath, connection.service(orgInvitesPath), {
    methods: orgInvitesMethods
  })
}
