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
  subscriptionTierUpgrade: 'subscription-tier-upgrade',
  cancelTierDowngrade: 'cancel-tier-downgrade',
  startSoloSubscriptionFromUnverified: 'start-solo-subscription-from-unverified',
}

export const SubscriptionTermTypeMap = {
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export const RatesMap = {
  Map
}

export function CalculateUpgradeNumbers(currentTier, currentTerm, lastValue, nextTier, nextTerm, nextAmount, lastRenewal, now) {
  // lasRenewal is the Date of the term renewal, NOT the date the payment cleared. Those can be different.
  let result = {
    customerCredit: 0,
    recognizedRevenue: 0,
    proportionalChargeAmount: 0,
  };
  //
  // determine how much as been used already (consumed)
  //
  let ratioConsumed = 0.0;
  switch (currentTerm) {
    case SubscriptionTermTypeMap.monthly:
      const lastRenewDayOfMonth = lastRenewal.getDate();
      const lastRenewMonth = lastRenewal.getMonth();
      const currentDayOfMonth = now.getDate();
      const currentMonth = now.getMonth();
      const previousMonth = (now.getMonth() - 1) % 2
      if (currentMonth === lastRenewMonth) {
        // last renewal happened in the current month
        if (currentDayOfMonth === lastRenewDayOfMonth) {
          // renewal happened today
          ratioConsumed = 0.0;
        } else if (currentDayOfMonth > lastRenewDayOfMonth) {
          // renewal happened this month x days ago
          const daysInCurrentMonth = 30.0; // TODO
          ratioConsumed = (currentDayOfMonth - lastRenewDayOfMonth) / daysInCurrentMonth;
        } else {
          throw new Error(`Previous renewal happened in the future ${lastRenewal}.`);
        }
      } else if (lastRenewMonth === previousMonth) {
        if (currentDayOfMonth === lastRenewDayOfMonth) {
          // renewal happened exactly one month ago
          ratioConsumed = 1.0;
        } else {
          const daysInLastMonth = 30.0; // TODO
          const days = currentDayOfMonth + (daysInLastMonth - lastRenewDayOfMonth);
          ratioConsumed = days / daysInLastMonth;
        }
      } else {
        throw new Error(`Previous renewal happened in a non-standard time frame ${lastRenewal}`);
      }
      break;
    case SubscriptionTermTypeMap.yearly:
      break;
    default:
      throw new Error(`Subscription Term ${currentTerm} not known.`);
  }
  if (ratioConsumed > 1.0) {
    ratioConsumed = 1.0;
  } else if (ratioConsumed < 0.0) {
    ratioConsumed = 0.0;
  }
  //
  // determine remaining ratio of upgrade
  //
  const remainingRatioOfNewTerm = 0.7 // TODO
  //
  // calculate
  //
  result.recognizedRevenue = Math.round(ratioConsumed * lastValue);
  let creditAvailable = lastValue - result.recognizedRevenue;
  let remainingAmount = Math.round(remainingRatioOfNewTerm * nextAmount)
  if (creditAvailable >= remainingAmount) {
    result.customerCredit = creditAvailable - remainingAmount;
    result.proportionalChargeAmount = 0;
  } else {
    result.customerCredit = 0;
    result.proportionalChargeAmount = remainingAmount - creditAvailable;
  }
  return result;
}


export default servicePlugin
