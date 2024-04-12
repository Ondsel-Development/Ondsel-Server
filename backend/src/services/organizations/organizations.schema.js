// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {
  getConstraint,
  subscriptionConstraintMap,
  SubscriptionTypeMap,
  userSummarySchema
} from '../users/users.subdocs.schema.js';
import {groupSummary} from "../groups/groups.subdocs.schema.js";
import {ObjectId} from "mongodb";
import {BadRequest} from "@feathersjs/errors";
import {refNameHasher} from "../../refNameFunctions.js";
import { buildUserSummary } from '../users/users.distrib.js';
import {OrganizationType, OrganizationTypeMap} from './organizations.subdocs.schema.js';
import {curationSchema} from "../../curation.schema.js";

const userDataSchema = Type.Intersect(
  [
    userSummarySchema,
    Type.Object({ isAdmin: Type.Boolean() }),
  ]
)

// Main data model schema
export const organizationSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    refName: Type.String(),
    refNameHash: Type.Number(), // later indexed, used for finding case-insensitive duplicates
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    description: Type.String(),
    users: Type.Array(userDataSchema),
    groups: Type.Array(groupSummary),
    owner: userSummarySchema,
    type: Type.Optional(OrganizationType),
    curation: Type.Optional(curationSchema),
    preferencesId: Type.Optional(ObjectIdSchema()),
    orgSecondaryReferencesId: ObjectIdSchema(),
    // Soft delete
    deleted: Type.Optional(Type.Boolean()),
  },
  { $id: 'Organization', additionalProperties: false }
)
export const organizationValidator = getValidator(organizationSchema, dataValidator)
export const organizationResolver = resolve({
  constraint: virtual(async (message, _context) => {
    if (message.owner) {
      try {
        const user = await _context.app.service('users').get(
          message.owner._id,
        );
        return getConstraint(user);
      } catch (error) {
      }
    }
    return _.get(subscriptionConstraintMap, SubscriptionTypeMap.unverified)
  })
})

export const organizationExternalResolver = resolve({})

// Schema for creating new entries
export const organizationDataSchema = Type.Pick(organizationSchema, ['name', 'refName', 'type', 'curation'], {
  $id: 'OrganizationData'
})
export const organizationDataValidator = getValidator(organizationDataSchema, dataValidator)
export const organizationDataResolver = resolve({
  _id: async() => new ObjectId(), // create purposefully rather than default to driver generation
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  refNameHash: async (_value, message, _context) => {
    return refNameHasher(message.refName)
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  description: async (_value, message, _context) => {
    return message.description || '';
  },
  users: async (_value, _message, context) => {
    return [
      {
        ...buildUserSummary(context.params.user),
        isAdmin: true,
      }
    ]
  },
  owner: async (_value, message, _context) => {
    return buildUserSummary(_context.params.user);
  },
  type: async (_value, message, _context) => {
    return message.type || OrganizationTypeMap.private;
  },
})

export const organizationPublicFields = ['_id', 'name', 'refName', 'description', 'type', 'createdAt', 'curation', 'users', 'owner'];

// Schema for updating existing entries
export const organizationPatchSchema = Type.Partial(organizationSchema, {
  $id: 'OrganizationPatch'
})
export const organizationPatchValidator = getValidator(organizationPatchSchema, dataValidator)
export const organizationPatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const organizationQueryProperties = Type.Pick(organizationSchema, ['_id', 'name', 'refName', 'description', 'type', 'refNameHash', 'createdBy', 'createdAt', 'owner', 'curation', 'users', 'deleted', 'orgSecondaryReferencesId'])
export const organizationQuerySchema = Type.Intersect(
  [
    querySyntax(organizationQueryProperties),
    // Add additional query properties here
    Type.Object({
      'owner._id': Type.Optional(ObjectIdSchema()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const organizationQueryValidator = getValidator(organizationQuerySchema, queryValidator)
export const organizationQueryResolver = resolve({})

export const uniqueOrgValidator = async (context) => {
  const orgService = context.app.service('organizations');
  if (context.data.refName) {
    const hash = refNameHasher(context.data.refName);
    const result = await orgService.find({query: {refNameHash: hash }});
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