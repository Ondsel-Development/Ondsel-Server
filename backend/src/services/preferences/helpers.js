import axios from 'axios';
import mongodb from 'mongodb';
import { BadRequest } from '@feathersjs/errors';

import { isUserOwnerOrAdminOfOrg } from '../organizations/helpers.js';
import { lookupUserConfigKeys, lookupSystemConfigKeys } from './preferences.config.js';
import { getLookupData } from './xmlUtils.js';
import { buildOrganizationSummary } from '../organizations/organizations.distrib.js';
import { buildUserSummary } from '../users/users.distrib.js';


const validateFileVersionPayload = context => {
  if (!context.data.version) {
    throw new BadRequest('version object is mandatory');
  }
  if (!context.data.version?.files) {
    throw new BadRequest('version.files should be mandatory.');
  }
  for (let fileVersion of context.data.version.files) {
    if (!fileVersion.fileName || !fileVersion.uniqueFileName) {
      throw new BadRequest('fileName or uniqueFileName cant be empty');
    }
  }
};


const generateFilesVersionPayload = async (context, filesVersion) => {

  const getLookupKeys = fileVersion => {
    let keys = [];
    if (fileVersion.fileName?.toUpperCase() === 'USER.CFG') {
      keys = lookupUserConfigKeys;
    } else if (fileVersion.fileName?.toUpperCase() === 'SYSTEM.CFG') {
      keys = lookupSystemConfigKeys;
    }
    if (fileVersion.additionalKeysToSave && Array.isArray(fileVersion.additionalKeysToSave)) {
      keys = keys.concat(fileVersion.additionalKeysToSave);
    }
    return keys;
  }

  const files = [];
  const uploadService = context.app.service('upload');
  for (let fileVersion of filesVersion) {
    const { url } = await uploadService.get(fileVersion.uniqueFileName);
    if (url) {
      const response = await axios.get(url);
      const prefData = getLookupData(response.data, getLookupKeys(fileVersion));
      files.push({
        fileName: fileVersion.fileName,
        uniqueFileName: fileVersion.uniqueFileName,
        additionalData: fileVersion.additionalData || {},
        data: prefData,
      })
    }
  }
  return {
    _id: (new mongodb.ObjectId()).toString(),
    createdAt: Date.now(),
    createdBy: buildUserSummary(context.params.user),
    files: files,
  };
};

export const validateAndFeedCreatePayload = async context => {

  // validating user's payload
  if (!context.data.organizationId) {
    throw new BadRequest('organizationId is mandatory');
  }

  validateFileVersionPayload(context);

  const organizationService = context.app.service('organizations');
  const organization = await organizationService.get(context.data.organizationId);

  if (organization.preferencesId) {
    throw new BadRequest('preferences object already initiated to organization, do patch');
  }

  const canUserAddPrefToOrg = isUserOwnerOrAdminOfOrg(organization, context.params.user);

  if (!canUserAddPrefToOrg) {
    throw new BadRequest('You dont have access to add preferences to organization');
  }

  // building payload
  const version = await generateFilesVersionPayload(context, context.data.version.files);
  context.data = {
    organization: buildOrganizationSummary(organization),
    versions: [version],
    currentVersionId: version._id,
  };
  return context;
};