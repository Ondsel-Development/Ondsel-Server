export const publisherPath = 'publisher'

export const publisherMethods = ['find', 'create', 'remove']

export const publisherClient = (client) => {
  const connection = client.get('connection')

  client.use(publisherPath, connection.service(publisherPath), {
    methods: publisherMethods
  })
}
