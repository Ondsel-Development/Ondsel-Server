export const userPath = 'users'

export const userMethods = ['get', 'find', 'create', 'patch', 'remove'] // 'find' is used by feathers-authentication-management behind-the-scenes

export const userClient = (client) => {
  const connection = client.get('connection')

  client.use(userPath, connection.service(userPath), {
    methods: userMethods
  })
}
