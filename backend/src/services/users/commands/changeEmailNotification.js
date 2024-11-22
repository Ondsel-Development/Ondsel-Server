// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from "lodash";
import {BadRequest} from "@feathersjs/errors";
import {NotificationCadenceTypeMap} from "../users.subdocs.schema.js";
import {mapMissingValue} from "../../../helpers.js";

export const changeEmailNotification = async (context) => {
  const { data } = context;
  const orgId = data.organizationId;
  const newCadence = data.notificationByEmailCadence;
  let organizationsList = context.beforePatchCopy.organizations;

  if (mapMissingValue(NotificationCadenceTypeMap, newCadence)) {
    throw new BadRequest(`unable to process a cadence of ${newCadence}`);
  }
  const index = organizationsList.findIndex(org => org._id.equals(orgId));
  if (index >= 0) {
    organizationsList[index].notificationByEmailCadence = newCadence;
  } else {
    throw new BadRequest(`unable to locate organization ${orgId} in user doc organizations.`);
  }

  context.data.organizations = organizationsList;
  context.data = _.omit(data, ['shouldChangeEmailNotification', 'organizationId', 'notificationByEmailCadence']);
}
