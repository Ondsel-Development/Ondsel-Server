export const directoryPath = 'directories'

export const directoryMethods = ['find', 'get', 'create', 'patch', 'remove']

export const directoryClient = (client) => {
  const connection = client.get('connection')

  client.use(directoryPath, connection.service(directoryPath), {
    methods: directoryMethods
  })
}
