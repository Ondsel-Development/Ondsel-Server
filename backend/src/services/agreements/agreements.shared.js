export const agreementsPath = 'agreements'

export const agreementsMethods = ['create', 'find', 'get']

export const agreementsClient = (client) => {
  const connection = client.get('connection')

  client.use(agreementsPath, connection.service(agreementsPath), {
    methods: agreementsMethods
  })
}
