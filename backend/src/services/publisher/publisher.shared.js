export const publisherPath = 'publisher'

export const publisherMethods = ['find', 'get', 'create', 'patch', 'remove']

export const publisherClient = (client) => {
  const connection = client.get('connection')

  client.use(publisherPath, connection.service(publisherPath), {
    methods: publisherMethods
  })
}
