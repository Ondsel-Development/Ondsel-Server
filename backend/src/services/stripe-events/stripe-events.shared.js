export const stripeEventsPath = 'stripe-events'

export const stripeEventsMethods = ['find', 'create', 'patch']

export const stripeEventsClient = (client) => {
  const connection = client.get('connection')

  client.use(stripeEventsPath, connection.service(stripeEventsPath), {
    methods: stripeEventsMethods
  })
}
