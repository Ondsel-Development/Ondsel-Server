export const emailPath = 'email'

export const emailMethods = ['find', 'get', 'create', 'patch', 'remove']

export const emailClient = (client) => {
  const connection = client.get('connection')

  client.use(emailPath, connection.service(emailPath), {
    methods: emailMethods
  })
}
