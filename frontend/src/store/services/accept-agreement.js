import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

class AcceptAgreement extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'AcceptAgreement'
  // Define default properties here
  static instanceDefaults() {
    return {
      userId: '',
      category: '',
      version: '',
      newAccount: false,
    }
  }

}

const servicePath = 'agreements/accept'
const servicePlugin = makeServicePlugin({
  'Model': AcceptAgreement,
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
