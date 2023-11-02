export const authManagementPath = 'auth-management'

export const authManagementMethods = ['find', 'get', 'create', 'patch', 'remove']

export const authManagementClient = (client) => {
  const connection = client.get('connection')

  client.use(authManagementPath, connection.service(authManagementPath), {
    methods: authManagementMethods
  })
}
