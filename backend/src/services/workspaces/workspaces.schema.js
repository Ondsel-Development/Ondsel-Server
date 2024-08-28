// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import {resolve, virtual} from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {SubscriptionTypeMap, userSummarySchema} from '../users/users.subdocs.schema.js';
import { groupSummary } from '../groups/groups.subdocs.schema.js';
import { directorySummary } from '../directories/directories.subdocs.js';
import {refNameHasher} from "../../refNameFunctions.js";
import {BadRequest} from "@feathersjs/errors";
import {organizationSummarySchema, OrganizationTypeMap} from "../organizations/organizations.subdocs.schema.js";
import {buildOrganizationSummary} from "../organizations/organizations.distrib.js";
import {buildUserSummary} from "../users/users.distrib.js";
import {LicenseType} from "./workspaces.subdocs.schema.js";
import {curationSchema} from "../../curation.schema.js";
import {ObjectId} from "mongodb";

const groupsOrUsers = Type.Object(
  {
    type: StringEnum(['User', 'Group']),
    permission: StringEnum(['read', 'write']),
    groupOrUser: Type.Union([userSummarySchema, groupSummary])
  }
)

// Main data model schema
export const workspaceSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    refName: Type.String(),
    refNameHash: Type.Number(), // later indexed, used for finding case-insensitive duplicates
    open: Type.Boolean(),
    license: Type.Optional(Type.Union([Type.Null(), LicenseType])),
    description: Type.String(), // limited by UI to
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    organizationId: ObjectIdSchema(),
    organization: organizationSummarySchema,
    rootDirectory: directorySummary,
    groupsOrUsers: Type.Array(groupsOrUsers),
    curation: Type.Optional(Type.Any()), // a curationSchema but I'm getting a circular ref error if I use that directly

    deleted: Type.Optional(Type.Boolean()),
    deletedAt: Type.Optional(Type.Number()),
    deletedBy: Type.Optional(ObjectIdSchema()), // userid of deleter
  },
  { $id: 'Workspace', additionalProperties: false }
)
export const workspaceValidator = getValidator(workspaceSchema, dataValidator)
export const workspaceResolver = resolve({
  haveWriteAccess: virtual(async (workspace, _context) => {
    const { user } = _context.params;
    if (!user) {
      return false;
    }
    const workspaceUsers = workspace.groupsOrUsers.filter(groupOrUser => groupOrUser.type === 'User' && groupOrUser.permission === 'write');
    if (workspaceUsers.some(d => d.groupOrUser._id.equals(user._id))) {
      return true;
    }

    const workspaceGroups = workspace.groupsOrUsers.filter(groupOrUser => groupOrUser.type === 'Group' && groupOrUser.permission === 'write');
    for (let e of workspaceGroups) {
      let group = await _context.app.service('groups').get(e.groupOrUser._id);
      if (group.users.some(u => u._id.equals(user._id))) {
        return true;
      }
    }
    return false;
  }),
  isUserDefaultWorkspace: virtual(async (workspace, context) => {
    if (workspace.organization.type !== OrganizationTypeMap.personal) {
      return false;
    }
    return workspace.refName === 'default'
  }),
})

export const workspaceExternalResolver = resolve({})

export const workspacePublicFields = ['_id', 'name', 'organizationId', 'organization', 'refName', 'open', 'license', 'description', 'createdAt', 'rootDirectory', 'curation'];

// Schema for creating new entries
export const workspaceDataSchema = Type.Pick(workspaceSchema, ['name', 'refName', 'description', 'organizationId'], {
  $id: 'WorkspaceData'
})
export const workspaceDataValidator = getValidator(workspaceDataSchema, dataValidator)
export const workspaceDataResolver = resolve({
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  refNameHash: async (_value, message, _context) => {
    return refNameHasher(message.refName)
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  groupsOrUsers: async (_value, _message, _context) => {
    return [
      {
        type: 'User',
        permission: 'write',
        groupOrUser: buildUserSummary(_context.params.user),
      }
    ]
  },
  organization: async (_value, message, context) => {
    const orgService = context.app.service('organizations');
    const orgId = message.organizationId;
    const org = await orgService.get(orgId);
    return buildOrganizationSummary(org);
  },
  open: async (value, message, context) => {
    const orgService = context.app.service('organizations');
    const org = await orgService.get(message.organizationId);
    const user = context.params.user;
    if (org.type === OrganizationTypeMap.private) {
      return value || false;
    }
    if (org.type === OrganizationTypeMap.personal) {
      if (user?.tier === SubscriptionTypeMap.unverified || user?.tier === SubscriptionTypeMap.solo) {
        return true; // if user isn't peer or greater, then a personal workspace is open no matter what
      } else {
        return value || false;
      }
    }
    // else org.type === open, so force to true regardless of passed-in parameter
    return true;
  },
})

// Schema for updating existing entries
export const workspacePatchSchema = Type.Partial(workspaceSchema, {
  $id: 'WorkspacePatch'
})
export const workspacePatchValidator = getValidator(workspacePatchSchema, dataValidator)
export const workspacePatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const workspaceQueryProperties = Type.Pick(workspaceSchema, [
  '_id', 'name', 'refName', 'open', 'license', 'description', 'refNameHash', 'organizationId', 'organization',
  'createdAt', 'rootDirectory', 'curation',
])
export const workspaceQuerySchema = Type.Intersect(
  [
    querySyntax(workspaceQueryProperties),
    // Add additional query properties here
    Type.Object({
      "organization": Type.Optional(organizationSummarySchema),
      "organization._id": Type.Optional(ObjectIdSchema()),
      "organization.refName": Type.Optional(Type.String()),
      'publicInfo': Type.Optional(Type.String()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const workspaceQueryValidator = getValidator(workspaceQuerySchema, queryValidator)
export const workspaceQueryResolver = resolve({})

export const uniqueWorkspaceValidator = async (context) => {
  const workspaceService = context.app.service('workspaces');
  if (context.data.refName) {
    const hash = refNameHasher(context.data.refName);
    const result = await workspaceService.find({query: {
      refNameHash: hash,
      organizationId: context.data.organizationId,
    }});
    if (result.total > 0) {
      throw new BadRequest('Invalid: reference name already taken', {
        errors: { email: 'reference name already taken' }
      })
    }
  } else {
    throw new BadRequest('Invalid Parameters', { // do not trust the frontend for this
      errors: { email: 'reference name required' }
    })
  }
}