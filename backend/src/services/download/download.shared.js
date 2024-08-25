export const downloadPath = 'download'

export const downloadMethods = ['get', 'create']

export const downloadClient = (client) => {
  const connection = client.get('connection')

  client.use(downloadPath, connection.service(downloadPath), {
    methods: downloadMethods
  })
}
