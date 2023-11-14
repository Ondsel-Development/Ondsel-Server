export const orgInvitesPath = 'org-invites'

export const orgInvitesMethods = ['find', 'get', 'create', 'patch', 'remove']

export const orgInvitesClient = (client) => {
  const connection = client.get('connection')

  client.use(orgInvitesPath, connection.service(orgInvitesPath), {
    methods: orgInvitesMethods
  })
}
