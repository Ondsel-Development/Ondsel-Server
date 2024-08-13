export const tripePath = 'tripe'

export const tripeMethods = ['find', 'get', 'create', 'patch', 'remove']

export const tripeClient = (client) => {
  const connection = client.get('connection')

  client.use(tripePath, connection.service(tripePath), {
    methods: tripeMethods
  })
}
