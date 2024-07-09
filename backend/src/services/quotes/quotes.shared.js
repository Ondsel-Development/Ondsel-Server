export const quotesPath = 'quotes'

export const quotesMethods = ['find', 'get', 'patch']

export const quotesClient = (client) => {
  const connection = client.get('connection')

  client.use(quotesPath, connection.service(quotesPath), {
    methods: quotesMethods
  })
}
