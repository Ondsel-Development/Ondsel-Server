

export async function DoCancelTierDowngrade(context, user) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let detail = SubscriptionTierDowngradeVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 2. this account event does NOT create a transaction.
  //    see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  //
  // 3. update the user doc
  //
  await context.app.service('users').patch(user._id, {
    nextTier: null,
    subscriptionTerm: detail.newTerm,
  });
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
}

function SubscriptionTierDowngradeVerification(context, user) {
  let result = {
    errMsg: "",
    desc: "",
    note: "",
    newTerm: "",
  }
  //
  // new tier
  //
  let currentTier = user.tier;
  if (context.data.detail.currentSubscription !== currentTier) {
    result.errMsg = `CALLER TO API BELIEVES THE CURRENT TIER IS ${context.data.detail.currentSubscription} BUT IT IS NOT`;
    return result;
  }
  if (context.data.subscription === null) {
    result.errMsg = `YOU CANNOT CANCEL TO NULL`
    return result;
  }
  //
  // restored term
  //
  result.newTerm = context.data.detail.term;
  if (result.newTerm === undefined || result.newTerm === null) {
    result.errMsg = `THE PREVIOUS TERM MUST BE SUPPLIED`; // TODO: make this more elegant
    return result;
  }
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `CANCELLING DOWNGRADE TO ${user.nextTier} FROM ${result.newTier}`;
  //
  // done
  //
  return result;
}
