export const userEngagementsPath = 'user-engagements'

export const userEngagementsMethods = ['get', 'create']

export const userEngagementsClient = (client) => {
  const connection = client.get('connection')

  client.use(userEngagementsPath, connection.service(userEngagementsPath), {
    methods: userEngagementsMethods
  })
}
