import { ProtectionTypeMap } from './shared-models.subdocs.schema.js';
import {BadRequest} from "@feathersjs/errors";
import _ from 'lodash';

export const validateSharedModelCreatePayload = async context => {
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

export async function buildFakeModelAndFileForActiveVersion(message, context) {
  // this function pulls from the DB to generate a psuedo Model and subtending File
  let finalModel = null;

  const {refFile, refModel} = await getReferenceFileAndModel(message, context);

  let strippedFile = _.omit(refFile, ['workspace', 'directory']);
  strippedFile.versions = refFile.versions.find(version => version._id.equals(refFile.currentVersionId));
  finalModel = _.omit(refModel, 'attributes');
  finalModel.file = strippedFile;

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
