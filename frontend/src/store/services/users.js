import _ from 'lodash';
import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

export const SubscriptionTypeMap = {
  unverified: 'Unverified',
  community: 'Community',
  solo: 'Solo',
  basic: 'Basic',
  peer: 'Peer',
  enterprise: 'Enterprise',
}

export const SubscriptionMonthlyPricingMap = {
  'Unverified': 0,
  'Community': 0,
  'Solo': 0,
  'Basic': 4,
  'Peer': 10,
  'Enterprise': 100,
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
      username: '',
      name: '',
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

  calculateRemainingModels(count) {
    if (this.tier === SubscriptionTypeMap.enterprise) {
      return `no limit (${count} active)`;
    }
    let max = this.constraint.maxModelObjects;
    if (count > max) {
      return `exceeded! Maximum is ${max}, currently at ${count}.`;
    }
    return `${max - count}`;
  }
}
const servicePath = 'users'
const servicePlugin = makeServicePlugin({
  Model: User,
  paramsForServer: ['publicInfo'],
  service: feathersClient.service(servicePath),
  servicePath
})

// Set up the client-side Feathers hooks.
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
