import {
  agreementCategoryTypeMap,
} from "../../agreements.schema.js";

export const doAcceptOneAgreement = async (context) => {
  const {user} = context.params;
  context.data.dbResultMsg = "agreement logic failed to complete.";
  const cat = context.data.category || "not-specified";
  const ver = context.data.version || "no-version-given";
  //
  // GET the current version for the category
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
  let sum = {
    agreementDocId: agreement.current.agreementDocId,
    category: cat,
    title: agreement.current.title,
    version: ver,
  };
  if (!user.agreementAccepted) {
    user.agreementAccepted = {
      currentPrivacyPolicyVersion: null,
      currentTermsOfServiceVersion: null,
      history: []
    };
  }
  if (!user.agreementAccepted.history) {
    user.agreementAccepted.history = [];
  }
  user.agreementAccepted.history.push(sum);
  switch (cat) {
    case agreementCategoryTypeMap.privacyPolicy:
      user.agreementAccepted.currentPrivacyPolicyVersion = ver;
      break;
    case agreementCategoryTypeMap.termsOfService:
      user.agreementAccepted.currentTermsOfServiceVersion = ver;
      break;
    default:
      break;
  }
  //
  // save the result
  //
  await context.app.service('users').patch(user._id, {
    agreementAccepted: user.agreementAccepted,
  });
  context.data.dbResultMsg = `saved acceptance to ${cat} version ${ver} to user ${user._id}`;
  return context;
}