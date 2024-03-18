import {agreementCategoryTypeMap} from "../../agreements.subdocs.js";

export const doAcceptOneAgreement = async (context) => {
  context.data.dbResultMsg = "agreement logic failed to complete.";
  const cat = context.data.category || "not-specified";
  const ver = context.data.version || "no-version-given";
  const userId = context.data.userId;
  const newAccountFlag = context.data.newAccount;
  //
  // GET User
  //
  const user = await context.app.service('users').get(userId);
  if (!user.agreementsAccepted) {
    user.agreementsAccepted = {
      currentPrivacyPolicyVersion: null,
      currentTermsOfServiceVersion: null,
      history: []
    };
  }
  //
  // verify things
  //
  let [errMsg, agreement] = await getLegalDoc(context, cat);
  if (errMsg !== null) {
    context.data.dbResultMsg = errMsg;
    return;
  }
  if (agreement.current.version !== ver) {
    context.data.dbResultMsg = `Cannot agree to version ${ver} of ${cat} as ${agreement.current.version} is the current version.`;
    return;
  }
  switch (cat) {
    case agreementCategoryTypeMap.privacyPolicy:
      if (ver === user.agreementsAccepted.currentPrivacyPolicyVersion) {
        context.data.dbResultMsg = `User has already agreed to version ${ver} of ${cat}.`;
        return;
      };
      break;
    case agreementCategoryTypeMap.termsOfService:
      if (ver === user.agreementsAccepted.currentTermsOfServiceVersion) {
        context.data.dbResultMsg = `User has already agreed to version ${ver} of ${cat}.`;
        return;
      };
      break;
    default:
      context.data.dbResultMsg = `There no support for a category of ${cat}.`;
      return;
  }
  let rightNow = Date.now();
  //
  // all is good. Prep for update.
  //
  let catList = [];
  if (newAccountFlag) {
     catList = [
       agreementCategoryTypeMap.privacyPolicy,
       agreementCategoryTypeMap.termsOfService,
     ];
  } else {
    catList = [ cat ];
  }
  for (const newCat of catList) {
    [errMsg, agreement] = await getLegalDoc(context, newCat);
    if (errMsg !== null) {
      context.data.dbResultMsg = errMsg;
      return;
    }
    switch (newCat) {
      case agreementCategoryTypeMap.privacyPolicy:
        user.agreementsAccepted.currentPrivacyPolicyVersion = agreement.current.version;
        break;
      case agreementCategoryTypeMap.termsOfService:
        user.agreementsAccepted.currentTermsOfServiceVersion = agreement.current.version;
        break;
      default:
        break;
    }
    user.agreementsAccepted.history.push({
      agreementDocId: agreement.current.agreementDocId,
      category: newCat,
      title: agreement.current.title,
      version: agreement.current.version,
      whenAgreedTo: new Date(rightNow).toUTCString(),
      when: rightNow,
    });
  }
  //
  // save the result
  //
  await context.app.service('users').patch(
    user._id,
    {
      agreementsAccepted: user.agreementsAccepted
    }
  );
  if (newAccountFlag) {
    context.data.dbResultMsg = `SUCCESS: saved acceptance for starting categories to user ${user._id}`;
  } else {
    context.data.dbResultMsg = `SUCCESS: saved acceptance to ${cat} version ${ver} to user ${user._id}`;
  }
  return context;
}

async function getLegalDoc(context, cat) {
  // GET the current agreement for the category
  let resultMsg = '';
  let agreementResult = await context.app.service('agreements').find({
    query: {
      category: cat
    }
  });
  if (!agreementResult === undefined || agreementResult.total === 0) {
    resultMsg = `Agreement of category ${cat} not found.`;
    return [resultMsg, null];
  }
  if (agreementResult.total > 1) {
    resultMsg = `INTERNAL ERROR: category ${cat} has ${agreementResult.total} documents.`;
    return [resultMsg, null];
  }
  const agreement = agreementResult.data[0];
  return [null, agreement];
}
