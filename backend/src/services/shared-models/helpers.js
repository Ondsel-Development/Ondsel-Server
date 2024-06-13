import { ProtectionTypeMap } from './shared-models.subdocs.schema.js';
import {BadRequest} from "@feathersjs/errors";
import _ from 'lodash';

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
  const { protection, pin, userId } = await context.service.get(context.id, { query: { $select: ['protection', 'pin', 'userId'] } });
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
    throw new BadRequest('incorrect pin');
  }

  if (protection === ProtectionTypeMap.direct) {
    throw new BadRequest('not implemented yet');
  }

  throw new BadRequest('Not able to recognised protection type on share link');
}