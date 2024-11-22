// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Script to manually verify user and migrate it to Solo user.

import { SubscriptionTypeMap, SubscriptionTermTypeMap } from '../services/users/users.subdocs.schema.js';
import { AccountEventTypeMap } from '../services/account-event/account-event.schema.js';

const userEmail = 'dcgrmg@gmail.com';

export async function upgradeUnverifiedUserToVerifiedAndMigrateToSoloTier(app) {
  const userService = app.service('users');
  const authService = app.service('auth-management');
  const accountEventService = app.service('account-event');
  console.log(`>>> Fetching user ${userEmail}`);
  const users = await userService.find({query: {email: userEmail}})
  if (users.total) {
    const user = users.data[0];
    console.log('>>> User found')
    if (!user.isVerified && user.tier === SubscriptionTypeMap.unverified) {
      console.log('>>> User is not verified and tier is Unverified, now make it verified and Solo tier...');
      const as = await authService.create({
        action: "verifySignupLong",
        value: user.verifyToken,
        notifierOptions: {},
      });
      console.log('>>>> auth service object: ', as);
      const ae = await accountEventService.create({
        event: AccountEventTypeMap.startSoloSubscriptionFromUnverified,
        userId: user._id.toString(),
        detail: {
          subscription: SubscriptionTypeMap.solo,
          term: SubscriptionTermTypeMap.yearly,
          currentSubscription: SubscriptionTypeMap.unverified
        },
        note: 'used feathersjs-auth-mgmt trigger on new account verification',
        additionalData: {
          message: 'This entry created by migration script manually'
        }
      }, { user: user })
      console.log('>>>> account-event object: ', ae);
    } else {
      console.log('>>> User is already verified, exiting....');
    }
  } else {
    console.log(`>>> No user found having email address ${userEmail}`);
  }
}
