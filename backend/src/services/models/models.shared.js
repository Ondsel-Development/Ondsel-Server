export const modelPath = 'models'

export const modelMethods = ['find', 'get', 'create', 'patch', 'remove']

export const modelClient = (client) => {
  const connection = client.get('connection')

  client.use(modelPath, connection.service(modelPath), {
    methods: modelMethods
  })
}
