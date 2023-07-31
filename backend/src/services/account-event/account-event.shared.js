export const accountEventPath = 'account-event'

export const accountEventMethods = ['find', 'get', 'create']

export const accountEventClient = (client) => {
  const connection = client.get('connection')

  client.use(accountEventPath, connection.service(accountEventPath), {
    methods: accountEventMethods
  })
}
