export const accountEventPath = 'account-event'

export const accountEventMethods = ['find', 'get', 'create', 'patch', 'remove']

export const accountEventClient = (client) => {
  const connection = client.get('connection')

  client.use(accountEventPath, connection.service(accountEventPath), {
    methods: accountEventMethods
  })
}
