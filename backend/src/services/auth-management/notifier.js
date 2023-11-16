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
          subject: "Please confirm this e-mail address for your Ondsel account",
          text: "To verify, click here: " + getLink('verify-email', user.verifyToken, user._id, baseUrl),
        });
      case authManagementActionTypeMap.verifySignupLong:
      case verifySignupGENERIC:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: user.email,
          subject: "E-Mail address for Ondsel Account verified",
          text: `Verification of ${user.email} complete. Thanks for working with us!`,
        });
      case authManagementActionTypeMap.sendResetPwd:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: user.email,
          subject: "Reset password for your Ondsel account.",
          text: `To reset your ${user.username} password, click here: `
            + getLink('change-password', user.resetToken, user._id, baseUrl),
        });
      case authManagementActionTypeMap.resetPwdLong:
      case resetPwdGENERIC:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: user.email,
          subject: "Notification: Ondsel password has been change",
          text: `Your password for ${user.username} has been successfully changed!`,
        });
      case orgInviteStateTypeMap.sendOrgInviteEmail:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: invite.email,
          subject: `[Ondsel] You have been invited to organization ${invite.organization.name}`,
          text: `You have been invited to join organization ${invite.organization.name}. `
            + getLink('join-org', invite.inviteToken, invite.organization._id, baseUrl),
        });
      case orgInviteStateTypeMap.verifyOrgInviteEmail:
        return sendEmail({
          from: 'contact@ondsel.com',
          to: invite.email, // NOTE: this email is the User's email; NOT the invite's original email (if different)
          subject: `[Ondsel] You have been Accepted to organization ${invite.organization.name}`,
          text: `You are now part of organization ${invite.organization.name}.`,
        });
      default:
        throw new BadRequest(`unhandled auth-management type ${type}`);
    }
  };
};
