export const userEngagementsPath = 'user-engagements'

export const userEngagementsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const userEngagementsClient = (client) => {
  const connection = client.get('connection')

  client.use(userEngagementsPath, connection.service(userEngagementsPath), {
    methods: userEngagementsMethods
  })
}
