export const acceptAgreementPath = 'agreements/accept'

export const acceptAgreementMethods = ['create']

export const acceptAgreementClient = (client) => {
  const connection = client.get('connection')

  client.use(acceptAgreementPath, connection.service(acceptAgreementPath), {
    methods: acceptAgreementMethods
  })
}
