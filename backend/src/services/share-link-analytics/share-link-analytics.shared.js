export const shareLinkAnalyticsPath = 'share-link-analytics'

export const shareLinkAnalyticsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const shareLinkAnalyticsClient = (client) => {
  const connection = client.get('connection')

  client.use(shareLinkAnalyticsPath, connection.service(shareLinkAnalyticsPath), {
    methods: shareLinkAnalyticsMethods
  })
}
