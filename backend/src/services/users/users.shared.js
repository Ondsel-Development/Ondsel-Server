export const userPath = 'users'

export const userMethods = ['get', 'create', 'patch']

export const userClient = (client) => {
  const connection = client.get('connection')

  client.use(userPath, connection.service(userPath), {
    methods: userMethods
  })
}
