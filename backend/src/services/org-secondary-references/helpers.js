// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {isUserMemberOfOrg, isUserOwnerOrAdminOfOrg} from '../organizations/helpers.js';
import { BadRequest } from '@feathersjs/errors';
import {CollectionNameMap} from "./bookmark.schema.js";
import {buildUserSummary} from "../users/users.distrib.js";
import {buildWorkspaceSummary} from "../workspaces/workspaces.distrib.js";
import {buildModelSummary} from "../models/models.distrib.js";
import {buildSharedModelSummary} from "../shared-models/shared-models.distrib.js";


export const canUserPatchOrgSecondaryReferences = async context => {
  const orgSecondaryReferences = await context.service.get(context.id);
  const organization = await context.app.service('organizations').get(orgSecondaryReferences.organizationId);
  if (isUserOwnerOrAdminOfOrg(organization, context.params.user)) {
    return context;
  }
  throw new BadRequest(`Only admins of organization ${context.id} allowed to perform this action`);
}


export const canUserGetOrgSecondaryReferences = async context => {
  const orgSecondaryReferences = await context.service.get(context.id);
  const organization = await context.app.service('organizations').get(orgSecondaryReferences.organizationId);
  if (isUserMemberOfOrg(organization, context.params.user)) {
    return context;
  }
  throw new BadRequest('Only members of organization allow to perform this action');
}

export const limitOrgSecondaryReferencesToUser = async context => {
  const { user } = context.params;
  const organizations = user.organizations || [];
  context.params.query['organizationId'] = {
    $in: organizations.map(org => org._id)
  };
  return context;
}

export const validatePayloadBookmarkObject = bookmark => {
  if (!bookmark) {
    throw new BadRequest('bookmark object is mandatory in payload');
  }
  if (!bookmark.collectionId) {
    throw new BadRequest('"collectionId" field is mandatory in bookmark object');
  }
  if (!bookmark.collectionName) {
    throw new BadRequest('"collection" field is mandatory in bookmark object');
  }
  if (!Object.values(CollectionNameMap).includes(bookmark.collectionName)) {
    throw new BadRequest('"collection" name is not recognized in bookmark object');
  }
};


export const CollectionNameMappingWithSummaryBuildMethods = {
  users: buildUserSummary,
  workspaces: buildWorkspaceSummary,
  models: buildModelSummary,
  'shared-models': buildSharedModelSummary,
}

