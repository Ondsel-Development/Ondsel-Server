import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

class AccountEvent extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'AccountEvent';
  // Define default properties here
  static instanceDefaults() {
    return {
      event: '',
      note: '', // not seen by end user
      amount: 0,
      originalCurrency: 'USD',
      originalAmt: undefined,
      detail: {
        subscription: '',
        term: '',
        currentSubscription: '',
      },
      success: false,
      resultMsg: '',
      additionalData: {},
    }
  }

  get successFlag() {
    return this.success;
  }
}

const servicePath = 'account-event'
const servicePlugin = makeServicePlugin({
  Model: AccountEvent,
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

export const AccountEventTypeMap = {
  initialSubscriptionPurchase : 'initial-subscription-purchase',
  recurringSubscriptionPurchase: 'recurring-subscription-purchase',
  subscriptionServiceCompleted: 'subscription-service-completed',
  subscriptionRefund: 'subscription-refund',
  subscriptionTierDowngrade: 'subscription-tier-downgrade',
}

export default servicePlugin
