// services/auth-management/notifier.js

import {authManagementActionType, authManagementActionTypeMap} from "./auth-management.schema.js";

export const notifier = (app) => {
  function getLink(type, hash, uid, baseUrl) {
    return baseUrl + '/' + type + '/' + hash + '/' + uid;
  }

  async function sendEmail(email) {
    try {
      const result = await app.service("email").create(email);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  // The "type"s used below:
  // "resendVerifySignup" - used to send a verification email.
  // "verifySignupLong" - used to confirm verification and set user.isVerified=true; which sends an email also
  // not used yet:
  // "verifySignupShort" - used to confirm verification and set user.isVerified=true; which sends a txt message also
  // "verifySignupSetPassword" from verifySignupSetPasswordLong and verifySignupSetPasswordShort API calls
  // "sendResetPwd" from sendResetPwd API call
  // "resetPwd" from resetPwdLong and resetPwdShort API calls
  // "passwordChange" from passwordChange API call
  // "identityChange" from identityChange API call
  //
  // see https://feathers-a-m.netlify.app/service-calls.html for more detail

  const verifyEmailMessage = "To verify, click here: ";

  return (type, user, notifierOptions = {}) => {
    const baseUrl = app.get('frontendUrl');
    if (type === authManagementActionTypeMap.resendVerifySignup) {
      return sendEmail({
        to: user.email,
        subject: "Please confirm this e-mail address for your Ondsel account",
        text: verifyEmailMessage + getLink('verify-email', user.verifyToken, user._id, baseUrl),
      });
    } else if (type === authManagementActionTypeMap.verifySignupLong) {
      return sendEmail({
        to: user.email,
        subject: "E-Mail address for Ondsel Account verified",
        text: `Verification of ${user.email} complete. Thanks for working with us!`,
      });
    }
  };
};
