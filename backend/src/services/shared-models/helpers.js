import { ProtectionTypeMap } from './shared-models.subdocs.schema.js';
import {BadRequest} from "@feathersjs/errors";
import _ from 'lodash';
import {buildUserSummary} from "../users/users.distrib.js";
import {removePrivateFileFields} from "../file/helpers.js";

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

export async function buildFakeModelAndFileForActiveVersion(message, context) {
  // this function pulls from the DB to generate a psuedo Model and subtending File
  let finalModel = null;

  let {refFile, refModel} = await getReferenceFileAndModel(message, context);

  const currentVersionId = refFile.currentVersionId;
  removePrivateFileFields(refFile);
  refFile.versions = refFile.versions.find(version => version._id.equals(currentVersionId));
  finalModel = _.omit(refModel, 'attributes');
  finalModel.file = refFile;

  return finalModel;
}

export async function buildFakeModelUrl(message, context) {
  const {refFile, refModel} = await getReferenceFileAndModel(message, context);

  return refModel.objUrl;
}

async function getReferenceFileAndModel(message, context) {
  const modelService = context.app.service('models');
  const fileService = context.app.service('file');
  let model = null;
  let file = null;

  // get file data
  const fileId = message.fileDetail.fileId;
  file = await fileService.get(fileId);

  // get model data
  if (file) {
    model = await modelService.get(file.modelId);
  }
  return {
    refFile: file,
    refModel: model
  };
}
