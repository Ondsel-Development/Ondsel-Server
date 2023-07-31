import {AccountEventType, AccountEventTypeMap} from "../services/account-event/account-event.schema.js";

export const clearResultsFieldsToDefault = function(hook) {
    hook.data.success = false;
    hook.data.resultMsg = "Internal error: performAccountEventLogic never completed; nor did it record a real error.";
}

export const performAccountEventLogic = function(hook) {
    // hook.data.success = true;
    switch(hook.data.event) {
        case AccountEventTypeMap.initialSubscriptionPurchase:
            DoInitialSubscriptionPurchase(hook);
            break;
        default:
            hook.data.resultMsg = "Business logic for event type not supported yet.";
            break;
    }
}

function DoInitialSubscriptionPurchase(hook) {
    // it is presumed that the processor has a confirmed charge at this point
    // hook.success is set to false already
    //
    // 1. verify supplied data
    //
    let amt = hook.data.amount;
    if (amt === undefined || amt == null ) {
        hook.data.resultMsg = "Amount must be set to an integer (in pennies) for this event type.";
        return;
    }
    amt = Math.round(amt);
    if (amt <= 1) {
        hook.data.resultMsg = "Amount must be a positive non-zero integer (in pennies) for this event type.";
        return;
    }
    if (amt > 100000) {
        hook.data.resultMsg = "Amount must be a below 100000 (1000.00 USD) to be valid.";
        return;
    }
    //
    // 2. get the user document
    //
    let tierChange = false;

    //
    // 3. calculate the proper journal entries, summarize, optional tier
    //

    //
    // 4. update the user doc
    //

    //
    // all is good; return message
    //
    hook.data.success = true;
    if (tierChange) {
        hook.data.resultMsg = "Completed user update with journal entries and changed tier to "; // + user.tier + ".";
    } else {
        hook.data.resultMsg = "Completed user update with journal entries.";
    }
}
