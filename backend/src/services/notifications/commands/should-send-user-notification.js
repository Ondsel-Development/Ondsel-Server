import {ObjectId} from "mongodb";
import {buildUserSummary} from "../../users/users.distrib.js";
import _ from "lodash";
import {buildOrganizationSummary} from "../../organizations/organizations.distrib.js";
import {notificationMessageMap, specificDeliveryMethodMap} from "../notifications.subdocs.js";
import {BadRequest} from "@feathersjs/errors";
import {generateGenericBodySummaryTxt, performExternalNotificationDelivery} from "../notifications.delivery.js";
import {strEqual} from "../../../helpers.js";

// example of messageDetail:
// {
//     to: '6526e74940840b9fa4ec51cc',
//     message: 'itemShared',
//     nav: {},
//     parameters: {sharelink: 'http://example.com/'}
// }
// the following are overwritten regardless of what is passed: _id, read, createdBy, when, methods, bodySummaryTxt

export const shouldSendUserNotification = async (context) => {
  //
  // setup and verify
  //
  let ntf = {...context.data.messageDetail};
  const targetUserId = new ObjectId(ntf.to);
  context.data = _.omit(context.data, ['shouldSendUserNotification', 'messageDetail']);
  //
  // build message 'ntf'
  //
  if (!notificationMessageMap.hasOwnProperty(ntf.message)) {
    throw new BadRequest(`message template ${ntf.message} does not exist.`);
  }
  ntf.read = false;
  ntf._id = new ObjectId();
  ntf.to = new ObjectId(ntf.to);
  ntf.createdBy = buildUserSummary(context.params.user);
  const currentOrgId = context.params.user.currentOrganizationId;
  const currentUserOrg = context.params.user.organizations.find((org) => strEqual(org._id, currentOrgId));
  ntf.from = buildOrganizationSummary(currentUserOrg);
  ntf.when = Date.now();
  ntf.bodySummaryTxt = await generateGenericBodySummaryTxt(ntf);
  //
  // deliver to email, sms, etc
  //
  try { // use try/catch since, strictly speaking, external notification is of secondary priority
    const externalDeliveryResult = await performExternalNotificationDelivery(targetUserId, ntf, context);
    ntf.deliveryDetails = externalDeliveryResult.details;
  } catch (e) {
    console.log(e.error)
  }
  //
  // store the new unread notification with full details
  //
  const notService = context.app.service('notifications');
  const notDb = await notService.options.Model;
  const updateResult = await notDb.updateOne(
    {userId: targetUserId},
    {
      '$push': {notificationsReceived: ntf}
    },
    {upsert: true},
  )
  //
  // respond back on patch
  //
  if (updateResult.matchedCount === 1) {
    context.result = {
      _id: context.id, // passing this back makes vuetify happy
      success: true,
      msg: 'Successfully sent notification',
    }
  } else if (updateResult.upsertedCount === 1) {
    context.result = {
      _id: context.id,
      success: true,
      msg: 'Successfully sent notification and created related notification doc.',
    }
  } else {
    context.result = {
      _id: context.id,
      success: false,
      msg: `failed to notify user ${targetUserId}`,
    }
  }
}