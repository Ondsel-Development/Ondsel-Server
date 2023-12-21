// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import {resolve, virtual} from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import { groupSummary } from '../groups/groups.subdocs.schema.js';
import { directorySummary } from '../directories/directories.subdocs.js';
import {refNameHasher} from "../../refNameFunctions.js";
import {BadRequest} from "@feathersjs/errors";
import {organizationSummarySchema} from "../organizations/organizations.subdocs.schema.js";
import {buildOrganizationSummary} from "../organizations/organizations.distrib.js";

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
    description: Type.String(),
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    organizationId: ObjectIdSchema(),
    organization: organizationSummarySchema,
    rootDirectory: directorySummary,
    groupsOrUsers: Type.Array(groupsOrUsers),
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
  })
})

export const workspaceExternalResolver = resolve({})

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
        groupOrUser: _.pick(_context.params.user,  ['_id', 'username', 'email', 'name']),
      }
    ]
  },
  organization: async (_value, message, context) => {
    const orgService = context.app.service('organizations');
    const orgId = message.organizationId;
    const org = await orgService.get(orgId);
    return buildOrganizationSummary(org);
  }
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
export const workspaceQueryProperties = Type.Pick(workspaceSchema, ['_id', 'name', 'refName', 'refNameHash', 'organizationId'])
export const workspaceQuerySchema = Type.Intersect(
  [
    querySyntax(workspaceQueryProperties),
    // Add additional query properties here
    Type.Object({
      "organization._id": Type.Optional(ObjectIdSchema()),
      "organization.refName": Type.Optional(Type.String()),
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