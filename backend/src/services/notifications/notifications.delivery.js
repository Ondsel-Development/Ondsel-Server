import {OrganizationTypeMap} from "../organizations/organizations.subdocs.schema.js";
import _ from "lodash";
import {NotificationCadenceTypeMap} from "../users/users.subdocs.schema.js";
import {notificationMessageMap, specificDeliveryMethodMap} from "./notifications.subdocs.js";

export async function generateGenericBodySummaryTxt(ntf) {
  let txt = "";
  txt += `User "${ntf.createdBy.name}"`;
  if (ntf.from.type !== OrganizationTypeMap.personal) {
    txt += ` on behalf of "${ntf.from.name}"`
  }
  switch (ntf.message){
    case notificationMessageMap.itemShared:
      // later; add support for the other types of things to share.
      txt += ` has shared a link to a specific CAD model`;
      if (ntf.parameters?.sharelink) {
        txt += ` at ${ntf.parameters?.sharelink}`;
      }
      txt += '.';
      break;
    default:
      txt += ' has notified you about something.';
      break;
  }
  return txt;
}

export async function performExternalNotificationDelivery(targetUserId, ntf, context) {
  let methods = [];

  const userService = context.app.service('users');
  const user = await userService.get(targetUserId);
  const orgId = user.personalOrganization._id;
  const settings = user.organizations.find((userOrg) => _.isEqual(userOrg._id, orgId));
  // we only do email right now
  if (settings.notificationByEmailCadence === NotificationCadenceTypeMap.live) {
    const result = await deliverViaMailchimpSMTP(user, ntf);
    if (result) {
      methods.push(specificDeliveryMethodMap.mailchimpSMTP);
    }
  }
  return {
    methods: methods,
  }
}

async function deliverViaMailchimpSMTP(user, ntf) {
  // TODO: continue here
  return true;
}
