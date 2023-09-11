// services/auth-management/notifier.js

export const notifier  = (app) => {
  function getLink(type, hash) {
    return "http://localhost:3030/" + type + "?token=" + hash;
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
  // "resendVerifySignup" from resendVerifySignup API call
  // "verifySignup" from verifySignupLong and verifySignupShort API calls
  // "verifySignupSetPassword" from verifySignupSetPasswordLong and verifySignupSetPasswordShort API calls
  // "sendResetPwd" from sendResetPwd API call
  // "resetPwd" from resetPwdLong and resetPwdShort API calls
  // "passwordChange" from passwordChange API call
  // "identityChange" from identityChange API call

  return (type, user, notifierOptions = {}) => {
    if (type === "resendVerifySignup") {
      return sendEmail({
        from: "test@localhost",
        to: user.email,
        subject: "Please confirm your e-mail address",
        text: "Click here: " + getLink("verify", user.verifyToken),
      });
    } else if (type === "verifySignup") {
      return sendEmail({
        from: "test@localhost",
        to: user.email,
        subject: "E-Mail address verified",
        text: "Registration process complete. Thanks for joining us!",
      });
    }
  };
};
