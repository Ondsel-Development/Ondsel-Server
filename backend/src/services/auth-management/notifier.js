// services/auth-management/notifier.js

import {authManagementActionTypeMap, resetPwdGENERIC, verifySignupGENERIC} from "./auth-management.schema.js";
import {BadRequest} from "@feathersjs/errors";
import {orgInviteStateTypeMap} from "../org-invites/org-invites.subdocs.schema.js";

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
  // "verifySignupShort" - (NOT ACTIVE YET) used to confirm verification and set user.isVerified=true; which sends a txt message also
  // "sendResetPwd" - used to send a password-change email
  // "resetPwdLong" - used to change the password using the resetToken
  //
  // see https://feathers-a-m.netlify.app/service-calls.html for more detail

  return async (type, user, notifierOptions = {}) => {
    const baseUrl = app.get('frontendUrl');
    const invite = user; // an alias for some contexts; see 'org-invites.class.js' for detail
    switch (type) {
      case authManagementActionTypeMap.resendVerifySignup:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: user.email,
          subject: `[Ondsel] Please confirm your Ondsel account`,
          text: "To verify your newly registered account with Ondsel, please click here: `
            + " + getLink('verify-email', user.verifyToken, user._id, baseUrl)
            + `\n\nYours sincerely,\n`
            + `Team Ondsel`,
        });
      case authManagementActionTypeMap.verifySignupLong:
      case verifySignupGENERIC:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: user.email,
          subject: `[Ondsel] Thanks for confirming your account`,
          text: `Verification of ${user.email} is complete. Welcome to Ondsel Lens!\n\n`
            + `Yours sincerely,\n`
            + `Team Ondsel`,
        });
      case authManagementActionTypeMap.sendResetPwd:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: user.email,
          subject: `[Ondsel] Reset password for your Ondsel account.`,
          text: `To reset your ${user.username} password, please click here: `
            + getLink('change-password', user.resetToken, user._id, baseUrl)
            + `\n\nYours sincerely,\n`
            + `Team Ondsel`
        });
      case authManagementActionTypeMap.resetPwdLong:
      case resetPwdGENERIC:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: user.email,
          subject: `[Ondsel] Your password has been changed`,
          text: `Your password for ${user.username} at Ondsel has been successfully changed.\n\n`
            + `Yours sincerely,\n`
            + `Team Ondsel`,
        });
      case orgInviteStateTypeMap.sendOrgInviteEmail:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: invite.email,
          subject: `[Ondsel] You have been invited to "${invite.organization.name}"`,
          text: `You have been invited to join an organization titled "${invite.organization.name}".\n`
            + `Please click the following link to accept: `
            + getLink('join-org', invite.inviteToken, invite.inviteId, baseUrl)
            + `\n\nYours sincerely,\n`
            + `Team Ondsel`,
        });
      case orgInviteStateTypeMap.verifyOrgInviteEmail:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: invite.email, // NOTE: this email is the User's email; NOT the invite's original email (if different)
          subject: `[Ondsel] You have been accepted to "${invite.organization.name}"`,
          text: `You are now a member of the "${invite.organization.name}" organization.\n\n`
            + `Yours sincerely,\n`
            + `Team Ondsel`,
        });
      default:
        throw new BadRequest(`unhandled auth-management type ${type}`);
    }
  };
};
