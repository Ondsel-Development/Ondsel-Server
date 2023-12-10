import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

class Organization extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Organization'
  // Define default properties here
  static instanceDefaults() {
    return {
      name: undefined,
      refName: "",
    }
  }

}
const servicePath = 'organizations'
const servicePlugin = makeServicePlugin({
  Model: Organization,
  service: feathersClient.service(servicePath),
  servicePath,
  extend({ store, module }) {
    return {
      getters: {
        isLoggedInUserAdmin: (state, getters, rootState, rootGetters) => (organization) => {
          const loggedInUser = rootGetters['auth/user'];
          return organization.users.some(user => user.isAdmin && user._id === loggedInUser._id)
        }
      }
    }
  }
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
