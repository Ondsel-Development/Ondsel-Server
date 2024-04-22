export const notificationsPath = 'notifications'

export const notificationsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const notificationsClient = (client) => {
  const connection = client.get('connection')

  client.use(notificationsPath, connection.service(notificationsPath), {
    methods: notificationsMethods
  })
}
