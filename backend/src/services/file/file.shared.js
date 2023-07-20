export const filePath = 'file'

export const fileMethods = ['find', 'get', 'create', 'patch']

export const fileClient = (client) => {
  const connection = client.get('connection')

  client.use(filePath, connection.service(filePath), {
    methods: fileMethods
  })
}
