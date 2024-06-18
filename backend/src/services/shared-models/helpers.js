import { ProtectionTypeMap } from './shared-models.subdocs.schema.js';
import {BadRequest} from "@feathersjs/errors";
import _ from 'lodash';
import {buildUserSummary} from "../users/users.distrib.js";

export const validateSharedModelCreatePayload = async context => {
  if (!context.data.protection) {
    context.data.protection = ProtectionTypeMap.unlisted;
  }
  if (context.data.pin) {
    context.data.protection = ProtectionTypeMap.pin;
  } else {
    context.data = _.omit(context.data, 'pin');
  }
  return context;
}


export const canUserAccessSharedModelGetMethod = async context => {
  const { protection, pin, userId, directSharedTo } = await context.service.get(context.id, { query: { $select: ['protection', 'pin', 'userId', 'directSharedTo'] } });
  if (context.params.user && context.params.user._id.equals(userId)) {
    return context;
  }

  if (protection === ProtectionTypeMap.listed || protection === ProtectionTypeMap.unlisted) {
    return context;
  }

  if (protection === ProtectionTypeMap.pin) {
    const queryPin = context.params.query.pin;
    if (!queryPin) {
      throw new BadRequest('MissingPin')
    }
    if (queryPin === pin) {
      return context;
    }
    throw new BadRequest('IncorrectPin');
  }

  if (protection === ProtectionTypeMap.direct) {
    if (directSharedTo.some(user => user._id.equals(context.params.user._id))) {
      return context;
    }
    throw new BadRequest('UserNotHaveAccess');
  }

  throw new BadRequest('Not able to recognised protection type on share link');
}

export const handleDirectSharedToUsers = async context => {
  if (context.data.directSharedToUserIds) {
    if (context.id) {
      const { protection } = await context.service.get(context.id);
      if (protection !== ProtectionTypeMap.direct) {
        context.data = _.omit(context.data, 'directSharedToUserIds');
        return context;
      }
    } else {
      if (context.data.protection !== ProtectionTypeMap.direct) {
        context.data = _.omit(context.data, 'directSharedToUserIds');
        return context;
      }
    }
    const directSharedTo = [];
    const userService = context.app.service('users');
    for (let userId of context.data.directSharedToUserIds) {
      const user = await userService.get(userId);
      directSharedTo.push(buildUserSummary(user));
    }
    context.data.directSharedTo = directSharedTo;
  }
  context.data = _.omit(context.data, 'directSharedToUserIds');
  return context;
}
