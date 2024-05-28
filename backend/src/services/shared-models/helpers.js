import { ProtectionTypeMap } from './shared-models.subdocs.schema.js';
import {BadRequest} from "@feathersjs/errors";

export const validateSharedModelCreatePayload = async context => {
  if (context.data.pin) {
    context.data.protection = ProtectionTypeMap.pin;
  }
  return context;
}


export const canUserAccessSharedModelGetMethod = async context => {
  const { protection, pin } = await context.service.get(context.id, { query: { $select: ['protection', 'pin'] } });
  console.log(protection, pin);

  if (protection === ProtectionTypeMap.listed || protection === ProtectionTypeMap.unlisted) {
    return context;
  }

  if (protection === ProtectionTypeMap.pin) {
    const queryPin = context.params.query.pin;
    if (!queryPin) {
      throw new BadRequest('pin is missing in query parameters')
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