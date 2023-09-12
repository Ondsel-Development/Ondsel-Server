import _ from 'lodash';
import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

export const SubscriptionTypeMap = {
  solo: 'Solo',
  peer: 'Peer',
  enterprise: 'Enterprise',
}
export const ANON = "anonymous"

export const SubscriptionTermTypeMap = {
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export const tierConstraintConfig = {
  ANON: {
    maxModelObjects: 0,
    maxShareLinksPerModel: 0,
    canUpdateModelParameters: false,
    canExportModel: false,
  },
  Solo: {
    maxModelObjects: 50,
    maxShareLinksPerModel: 2,
    canUpdateModelParameters: false,
    canExportModel: false,
  },
  Peer: {
    maxModelObjects: 250,
    maxShareLinksPerModel: 10,
    canUpdateModelParameters: true,
    canExportModel: true,
  },
  Enterprise: {
    maxModelObjects: 1000,
    maxShareLinksPerModel: 100,
    canUpdateModelParameters: true,
    canExportModel: true,
  },
};

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

  calculateRemainingModels(count) {
    if (this.tier === SubscriptionTypeMap.enterprise) {
      return `no limit (${count} active)`;
    }
    let max = this.tierConfig.maxModelObjects;
    if (count > max) {
      return `exceeded! Maximum is ${max}, currently at ${count}.`;
    }
    return `${max - count}`;
  }

  get tierConfig() {
    return _.get(tierConstraintConfig, this.tier, ANON);
  }
}
const servicePath = 'users'
const servicePlugin = makeServicePlugin({
  Model: User,
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
