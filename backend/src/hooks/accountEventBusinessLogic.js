import {
  AccountEventType,
  AccountEventTypeMap,
} from "../services/account-event/account-event.schema.js";
import {DoInitialSubscriptionPurchase} from "../businessLogic/DoInitialSubscriptionPurchase.js";
import {DoRecurringSubscriptionPurchase} from "../businessLogic/DoRecurringSubscriptionPurchase.js";

export const performAccountEventLogic = async (context) => {
  switch (context.data.event) {
    case AccountEventTypeMap.initialSubscriptionPurchase:
      await DoInitialSubscriptionPurchase(context);
      break;
    case AccountEventTypeMap.recurringSubscriptionPurchase:
      await DoRecurringSubscriptionPurchase(context);
      break;
    default:
      context.data.resultMsg = "Business logic for event type not supported yet.";
      break;
  }
  return context;
}
