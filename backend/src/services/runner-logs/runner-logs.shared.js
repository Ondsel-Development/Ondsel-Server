export const runnerLogsPath = 'runner-logs'

export const runnerLogsMethods = ['get', 'create']

export const runnerLogsClient = (client) => {
  const connection = client.get('connection')

  client.use(runnerLogsPath, connection.service(runnerLogsPath), {
    methods: runnerLogsMethods
  })
}
