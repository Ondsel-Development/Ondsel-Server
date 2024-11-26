// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const runnerLogsPath = 'runner-logs'

export const runnerLogsMethods = ['get', 'create']

export const runnerLogsClient = (client) => {
  const connection = client.get('connection')

  client.use(runnerLogsPath, connection.service(runnerLogsPath), {
    methods: runnerLogsMethods
  })
}
