import {
  agreementCategoryTypeMap,
} from "../../agreements.schema.js";

export const doAcceptOneAgreement = async (context) => {
  const {user} = context.params;
  context.data.dbResultMsg = "agreement logic failed to complete.";
  const cat = context.data.category || "not-specified";
  const ver = context.data.version || "no-version-given";
  if (!user.agreementsAccepted) {
    user.agreementsAccepted = {
      currentPrivacyPolicyVersion: null,
      currentTermsOfServiceVersion: null,
      history: []
    };
  }
  //
  // GET the current agreement for the category
  //
  let agreementResult = await context.app.service('agreements').find({
    query: {
      category: cat
    }
  });
  if (!agreementResult === undefined || agreementResult.total === 0) {
    context.data.dbResultMsg = `Agreement of category ${cat} not found.`;
    return;
  }
  if (agreementResult.total > 1) {
    context.data.dbResultMsg = `INTERNAL ERROR: category ${cat} has ${agreementResult.total} documents.`;
    return;
  }
  const agreement = agreementResult.data[0];
  //
  // verify and summarize things
  //
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
  let sum = {
    agreementDocId: agreement.current.agreementDocId,
    category: cat,
    title: agreement.current.title,
    version: ver,
    whenAgreedTo: new Date(rightNow).toUTCString(),
    when: rightNow,
  };
  user.agreementsAccepted.history.push(sum);
  switch (cat) {
    case agreementCategoryTypeMap.privacyPolicy:
      user.agreementsAccepted.currentPrivacyPolicyVersion = ver;
      break;
    case agreementCategoryTypeMap.termsOfService:
      user.agreementsAccepted.currentTermsOfServiceVersion = ver;
      break;
    default:
      break;
  }
  //
  // save the result
  //
  await context.app.service('users').patch(user._id, {
    agreementsAccepted: user.agreementsAccepted,
  });
  context.data.dbResultMsg = `SUCCESS: saved acceptance to ${cat} version ${ver} to user ${user._id}`;
  return context;
}
