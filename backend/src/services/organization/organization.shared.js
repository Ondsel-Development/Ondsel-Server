export const organizationPath = 'organization'

export const organizationMethods = ['find', 'get', 'create', 'patch', 'remove']

export const organizationClient = (client) => {
  const connection = client.get('connection')

  client.use(organizationPath, connection.service(organizationPath), {
    methods: organizationMethods
  })
}
