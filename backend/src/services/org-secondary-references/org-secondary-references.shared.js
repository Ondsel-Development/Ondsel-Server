export const orgSecondaryReferencesPath = 'org-secondary-references'

export const orgSecondaryReferencesMethods = ['find', 'get', 'create', 'patch', 'remove']

export const orgSecondaryReferencesClient = (client) => {
  const connection = client.get('connection')

  client.use(orgSecondaryReferencesPath, connection.service(orgSecondaryReferencesPath), {
    methods: orgSecondaryReferencesMethods
  })
}
