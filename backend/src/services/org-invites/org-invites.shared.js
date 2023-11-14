export const orgInvitesPath = 'org-invites'

export const orgInvitesMethods = ['find', 'create', 'patch']

export const orgInvitesClient = (client) => {
  const connection = client.get('connection')

  client.use(orgInvitesPath, connection.service(orgInvitesPath), {
    methods: orgInvitesMethods
  })
}
