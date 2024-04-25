export const notificationsPath = 'notifications'

export const notificationsMethods = ['get', 'patch']

export const notificationsClient = (client) => {
  const connection = client.get('connection')

  client.use(notificationsPath, connection.service(notificationsPath), {
    methods: notificationsMethods
  })
}
