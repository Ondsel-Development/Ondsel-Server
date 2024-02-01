export const keywordsPath = 'keywords'

export const keywordsMethods = ['get']

export const keywordsClient = (client) => {
  const connection = client.get('connection')

  client.use(keywordsPath, connection.service(keywordsPath), {
    methods: keywordsMethods
  })
}
