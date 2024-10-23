export const stripeEventsPath = 'stripe-events'

export const stripeEventsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const stripeEventsClient = (client) => {
  const connection = client.get('connection')

  client.use(stripeEventsPath, connection.service(stripeEventsPath), {
    methods: stripeEventsMethods
  })
}
