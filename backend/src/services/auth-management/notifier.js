// services/auth-management/notifier.js

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
  // "resendVerifySignup" - used to verify an email.
  // "verifySignup" from verifySignupLong and verifySignupShort API calls
  // "verifySignupSetPassword" from verifySignupSetPasswordLong and verifySignupSetPasswordShort API calls
  // "sendResetPwd" from sendResetPwd API call
  // "resetPwd" from resetPwdLong and resetPwdShort API calls
  // "passwordChange" from passwordChange API call
  // "identityChange" from identityChange API call

  const verifyEmailMessage = "To verify, click here: ";

  return (type, user, notifierOptions = {}) => {
    const baseUrl = app.get('frontendUrl');
    if (type === "resendVerifySignup") {
      return sendEmail({
        to: user.email,
        subject: "Please confirm this e-mail address for your Ondsel account",
        text: verifyEmailMessage + getLink('verify-email', user.verifyToken, user._id, baseUrl),
      });
    } else if (type === "verifySignup") {
      return sendEmail({
        to: user.email,
        subject: "E-Mail address verified",
        text: "Registration process complete. Thanks for joining us!",
      });
    }
  };
};
