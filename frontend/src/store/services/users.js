import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

export const SubscriptionTypeMap = {
  solo: 'Solo',
  peer: 'Peer',
  enterprise: 'Enterprise',
}

export const SubscriptionTermTypeMap = {
  monthly: 'Monthly',
  yearly: 'Yearly',
}

class User extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'User'

  // Define default properties here
  static instanceDefaults() {
    return {
      email: '',
      password: '',
      screenName: '',
      firstName: '',
      lastName: '',
    }
  }

  get isPeerTier() {
    return this.tier === SubscriptionTypeMap.peer;
  }

  get isEnterpriseTier() {
    return this.tier === SubscriptionTypeMap.enterprise;
  }

  get fullTierName() {
    let tierName = this.tier;
    if (this.nextTier !== undefined && this.nextTier !== null) {
      tierName += ` (but destined for ${this.nextTier} on next renewal)`
    }
    return tierName;
  }

  get shortTierName() {
    let tierName = this.tier;
    if (this.nextTier !== undefined && this.nextTier !== null) {
      tierName += ` -> ${this.nextTier}`
    }
    return tierName;
  }
}
const servicePath = 'users'
const servicePlugin = makeServicePlugin({
  Model: User,
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
