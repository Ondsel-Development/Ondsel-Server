export const uploadPath = 'upload'

export const uploadMethods = ['get', 'create']

export const uploadClient = (client) => {
  const connection = client.get('connection')

  client.use(uploadPath, connection.service(uploadPath), {
    methods: uploadMethods
  })
}
