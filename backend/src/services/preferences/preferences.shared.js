export const preferencesPath = 'preferences'

export const preferencesMethods = ['find', 'get', 'create', 'patch', 'remove']

export const preferencesClient = (client) => {
  const connection = client.get('connection')

  client.use(preferencesPath, connection.service(preferencesPath), {
    methods: preferencesMethods
  })
}
