import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

class File extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'File'
  // Define default properties here
  static instanceDefaults() {
    return {
      custFileName: undefined,
      currentVersionId: undefined,
      userId: null,
      modelId: null,
      isSystemGenerated: false,
      createdAt: null,
      updatedAt: null,
      versions: [],
      deleted: null,
      uniqueFileName: '',
    }
  }
}
const servicePath = 'file'
const servicePlugin = makeServicePlugin({
  'Model': File,
  service: feathersClient.service(servicePath),
  servicePath
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default servicePlugin
