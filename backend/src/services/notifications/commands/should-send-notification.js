import {ObjectId} from "mongodb";
import {buildUserSummary} from "../../users/users.distrib.js";
import _ from "lodash";
import {buildOrganizationSummary} from "../../organizations/organizations.distrib.js";
import {specificDeliveryMethodMap} from "../notifications.subdocs.js";
import {BadRequest} from "@feathersjs/errors";


export const shouldSendNotification = async (context) => {
  const userId = context.id || null;
  const selfId = context.params.user._id.toString();
  if (!_.isEqual(selfId, userId)) {
    console.log(`user ${selfId} attempted to send a notification on behalf of ${userId} notifications`);
    throw new BadRequest('User does not have permission');
  }
  let ntf = {...context.data.messageDetail};
  context.data = _.omit(context.data, ['shouldSendNotification', 'messageDetail']);

  // example of messageDetail:
  // {
  //     to: '6526e74940840b9fa4ec51cc',
  //     message: 'itemShared',
  //     parameters: {sharelink: 'http://example.com/'}
  // }
  // the following are overwritten regardless of what is passed: _id, read, createdBy, when, method, bodySummaryTxt
  ntf.read = false;
  ntf._id = new ObjectId();
  ntf.createdBy = buildUserSummary(context.params.user);
  const currentOrgId = context.params.user.currentOrganizationId;
  const currentUserOrg = context.params.user.organizations.find((org) => _.isEqual(org._id, currentOrgId));
  ntf.from = buildOrganizationSummary(currentUserOrg);
  const targetUserId = new ObjectId(ntf.to);
  ntf.bodySummaryTxt = 'TODO => build this from notification system';
  ntf.method = specificDeliveryMethodMap.mailchimpSMTP;
  ntf.when = Date.now();

  const notService = context.app.service('notifications');
  const notDb = await notService.options.Model;
  const updateResult = await notDb.updateOne(
    {userId: targetUserId},
    {
      '$push': {notificationsReceived: ntf}
    },
    {upsert: true},
  )
  console.log(JSON.stringify(updateResult));
  if (updateResult.matchedCount === 1) {
    context.result = {
      _id: userId, // passing this back makes vuetify happy
      success: true,
      msg: 'Successfully sent notification',
    }
  } else if (updateResult.upsertedCount === 1) {
    context.result = {
      _id: userId,
      success: true,
      msg: 'Successfully sent notification and created related notification doc.',
    }
  } else {
    context.result = {
      _id: userId,
      success: false,
      msg: `failed to notify user ${targetUserId}`,
    }
  }
}