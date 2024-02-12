// Script to manually upgrade user tier from Solo to Peer.
// It creates an entry in account event collection with amount USD $120 with yearly subscription term.

import { SubscriptionTypeMap, SubscriptionTermTypeMap } from '../services/users/users.subdocs.schema.js';
import { AccountEventTypeMap } from '../services/account-event/account-event.schema.js';

const userEmail = 'p_a@live.ru';

export async function upgradeUserTierCommand(app) {
  const userService = app.service('users');
  const accountEventService = app.service('account-event');
  console.log(`>>> Fetching user ${userEmail}`);
  const users = await userService.find({query: {email: userEmail}})
  if (users.total) {
    const user = users.data[0];
    console.log('>>> User found')
    if (user.tier === SubscriptionTypeMap.solo) {
      console.log('>>> User tier is Solo, now migrating to Peer tier...');
      const accountEvent = await accountEventService.create({
        event: AccountEventTypeMap.initialSubscriptionPurchase,
        detail: {
          subscription: SubscriptionTypeMap.peer,
          currentSubscription: user.tier,
          term: SubscriptionTermTypeMap.yearly
        },
        amount: 12000, // $120.00
        originalCurrency: 'USD',
        originalAmt: '120.00',
        note: 'frontend InitialPurchaseForPeer page call',
        additionalData: {
          message: 'This entry created by migration script manually'
        }
      }, { user: user })
      console.log(`>>> AccountEvent entry created (id: ${accountEvent._id.toString()})`);
    } else {
      console.log('>>> User tier is not Solo, exiting...');
    }
  } else {
    console.log(`>>> No user found having email address ${userEmail}`);
  }

}
