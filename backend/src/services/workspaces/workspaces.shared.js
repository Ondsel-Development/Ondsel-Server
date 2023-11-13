export const workspacePath = 'workspaces'

export const workspaceMethods = ['find', 'get', 'create', 'patch', 'remove']

export const workspaceClient = (client) => {
  const connection = client.get('connection')

  client.use(workspacePath, connection.service(workspacePath), {
    methods: workspaceMethods
  })
}
