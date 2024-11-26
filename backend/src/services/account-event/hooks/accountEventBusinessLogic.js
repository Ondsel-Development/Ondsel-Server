// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  AccountEventTypeMap,
} from "../account-event.schema.js";
import {DoInitialSubscriptionPurchase} from "../businessLogic/DoInitialSubscriptionPurchase.js";
import {DoRecurringSubscriptionPurchase} from "../businessLogic/DoRecurringSubscriptionPurchase.js";
import {DoSubscriptionServiceCompleted} from "../businessLogic/DoSubscriptionServiceCompleted.js";
import {DoSubscriptionRefund} from "../businessLogic/DoSubscriptionRefund.js";
import {DoSubscriptionTierDowngrade} from "../businessLogic/DoSubscriptionTierDowngrade.js";
import {DoCancelTierDowngrade} from "../businessLogic/DoCancelTierDowngrade.js";
import {DoStartSoloSubscriptionFromUnverified} from "../businessLogic/DoStartSoloSubscriptionFromUnverified.js";

export const performAccountEventLogic = async (context) => {
  const { user } = context.params;
  switch (context.data.event) {
    case AccountEventTypeMap.initialSubscriptionPurchase:
      await DoInitialSubscriptionPurchase(context, user);
      break;
    case AccountEventTypeMap.recurringSubscriptionPurchase:
      await DoRecurringSubscriptionPurchase(context, user);
      break;
    case AccountEventTypeMap.subscriptionServiceCompleted:
      await DoSubscriptionServiceCompleted(context, user);
      break;
    case AccountEventTypeMap.subscriptionRefund:
      await DoSubscriptionRefund(context, user);
      break;
    case AccountEventTypeMap.subscriptionTierDowngrade:
      await DoSubscriptionTierDowngrade(context, user);
      break;
    case AccountEventTypeMap.cancelTierDowngrade:
      await DoCancelTierDowngrade(context, user);
      break;
    case AccountEventTypeMap.startSoloSubscriptionFromUnverified:
      await DoStartSoloSubscriptionFromUnverified(context, user);
      break;
    default:
      context.data.resultMsg = "Business logic for event type not supported yet.";
      break;
  }
  return context;
}
