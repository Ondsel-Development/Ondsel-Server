export const orgOrdersPath = 'org-orders'

export const orgOrdersMethods = ['find', 'get', 'create', 'patch', 'remove']

export const orgOrdersClient = (client) => {
  const connection = client.get('connection')

  client.use(orgOrdersPath, connection.service(orgOrdersPath), {
    methods: orgOrdersMethods
  })
}
