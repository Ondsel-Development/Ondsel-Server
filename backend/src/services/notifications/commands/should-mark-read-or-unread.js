// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ObjectId} from "mongodb";
import {buildUserSummary} from "../../users/users.distrib.js";
import _ from "lodash";
import {buildOrganizationSummary} from "../../organizations/organizations.distrib.js";
import {specificDeliveryMethodMap} from "../notifications.subdocs.js";
import {BadRequest} from "@feathersjs/errors";
import {generateGenericBodySummaryTxt, performExternalNotificationDelivery} from "../notifications.delivery.js";

// this function REQUIRES a copy of the original notifications doc in context.beforePatchCopy.
export const shouldMarkReadOrUnread = async (context) => {
  //
  // setup and verify
  //
  const markRead = context.data.markRead === true;
  const notificationIds = context.data.notificationIds || [];
  //
  // modify notification array
  //
  const originalNotifications = context.beforePatchCopy.notificationsReceived || [];
  let newNotifications = [];
  let ctr = 0;
  for (let ntf of originalNotifications) {
    if (notificationIds.includes(ntf._id.toString())) {
      ntf.read = markRead;
      ctr++;
    }
    newNotifications.push(ntf);
  }
  //
  // pass on the new array for patching
  //
  context.data.notificationsReceived = newNotifications;
  //
  // cleanup
  //
  context.data = _.omit(context.data, ['shouldMarkReadOrUnread', 'markRead', 'notificationIds' ]);
  return context;
}
