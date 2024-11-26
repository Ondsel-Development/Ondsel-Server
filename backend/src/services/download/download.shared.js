// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const downloadPath = 'download'

export const downloadMethods = ['get', 'create']

export const downloadClient = (client) => {
  const connection = client.get('connection')

  client.use(downloadPath, connection.service(downloadPath), {
    methods: downloadMethods
  })
}
