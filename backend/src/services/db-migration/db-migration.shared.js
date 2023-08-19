export const dbMigrationPath = 'db-migration'

export const dbMigrationMethods = ['find', 'get', 'create']

export const dbMigrationClient = (client) => {
  const connection = client.get('connection')

  client.use(dbMigrationPath, connection.service(dbMigrationPath), {
    methods: dbMigrationMethods
  })
}
