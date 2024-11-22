// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ProtectionTypeMap, VersionFollowTypeMap} from './shared-models.subdocs.schema.js';
import {BadRequest} from "@feathersjs/errors";
import _ from 'lodash';
import {buildUserSummary} from "../users/users.distrib.js";
import {GetUrlFromFileLatestVersion, removePrivateFileFields} from "../file/helpers.js";

export const validateSharedModelCreatePayload = async context => {
  if (!context.data.protection) {
    context.data.protection = ProtectionTypeMap.unlisted;
  }
  if (context.data.protection === ProtectionTypeMap.listed) {
    let thumbnailUrl = await findThumbnailIfThereIsOne(context, context.data);
    if (thumbnailUrl) {
      context.data.isThumbnailGenerated = true;
    }
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
  const versionsAvailable = refFile.versions || [];
  refFile.versions = versionsAvailable.find(version => version._id.equals(currentVersionId));
  finalModel = _.omit(refModel, 'attributes');
  finalModel.file = refFile;

  return finalModel;
}

export async function buildFakeModelUrl(message, context) {
  const {refFile, refModel} = await getReferenceFileAndModel(message, context);
  let url = null;
  if (refFile) {
    url = GetUrlFromFileLatestVersion(refFile);
  }
  return url
}

async function getReferenceFileAndModel(message, context) {
  // DO NOT use the .find functions as those endpoint throw errors on deleted items which wreaks havoc
  // during distributed deletion
  const modelService = context.app.service('models');
  const modelDb = await modelService.options.Model;
  const fileService = context.app.service('file');
  const fileDb = await fileService.options.Model;
  let model = null;
  let file = null;

  // get file data if it exists
  const fileId = message.fileDetail.fileId;
  file = await fileDb.findOne(
    {_id: fileId}
  );

  // get model data if it exists
  if (file) {
    model = await modelDb.findOne(
      {_id: file.modelId}
    );
  }
  return {
    refFile: file,
    refModel: model
  };
}

export async function findThumbnailIfThereIsOne(context, sharedModel) {
  let result = null;
  let modelId = null;
  if (sharedModel.versionFollowing === VersionFollowTypeMap.active) {
    modelId = sharedModel.cloneModelId.toString();
  } else {
    if (sharedModel.dummyModelId) {
      modelId = sharedModel.dummyModelId.toString();
    }
  }
  if (modelId) {
    try {
      const r = await context.app.service('upload').get(`public/${modelId}_thumbnail.PNG`);
      result = r.url || null;
    } catch (e) {
      //
    }
  }
  return result;
}

export function generateDefaultTitle(sharedModel, file) {
  if (!file) {
    return "A ShareLink";
  }
  let version = null;
  if (sharedModel.versionFollowing === VersionFollowTypeMap.active) {
    version = file.versions.find(version => version._id.equals(file.currentVersionId));
  } else {
    version = file.versions.find(version => version._id.equals(sharedModel.fileDetail.versionId));
  }
  const msg = version?.message;
  if (msg) {
    return `${file.custFileName} - ${msg}`
  }
  return `${file.custFileName}`;
}


export const handleAdditionalDataQuery = () => {
  return async (context, next) => {
    // this is an "around" hook
    if (context.params?.query?.additionalData) {
      context.$additionalData = context.params?.query?.additionalData === "true";
      delete context.params.query.additionalData;
    }
    await next();
    return context;
  }
}
