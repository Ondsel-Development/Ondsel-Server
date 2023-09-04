export const sitemapsPath = 'sitemaps'

export const sitemapsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const sitemapsClient = (client) => {
  const connection = client.get('connection')

  client.use(sitemapsPath, connection.service(sitemapsPath), {
    methods: sitemapsMethods
  })
}
