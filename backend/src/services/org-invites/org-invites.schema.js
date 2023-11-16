// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { orgInvitesResultSchema, orgInviteStateType } from "./org-invites.subdocs.schema.js";
import { userSummarySchema } from "../users/users.subdocs.schema.js";
import { organizationSummarySchema } from "../organizations/organizations.subdocs.schema.js";
import { v4 as uuidv4 } from 'uuid';
import {buildUserSummary} from "../users/users.distrib.js";
import _ from "lodash";

// Main data model schema
export const orgInvitesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    state: orgInviteStateType,
    //
    inviteToken: Type.Optional(Type.String()),
    toEmail: Type.String({ format: "email"}),
    personInviting: userSummarySchema,
    createdAt: Type.Number(),
    organization: organizationSummarySchema,
    active: Type.Boolean(),
    result: orgInvitesResultSchema,
  },
  { $id: 'OrgInvites', additionalProperties: false }
)
export const orgInvitesValidator = getValidator(orgInvitesSchema, dataValidator)
export const orgInvitesResolver = resolve({})

export const orgInvitesExternalResolver = resolve({})

// Schema for creating new entries
export const orgInvitesDataSchema = Type.Pick(orgInvitesSchema, [
  'state',
  'toEmail',
  'organization'
], {
  $id: 'OrgInvitesData'
})
export const orgInvitesDataValidator = getValidator(orgInvitesDataSchema, dataValidator)
export const orgInvitesDataResolver = resolve({
  personInviting: async(_value, _message, context) => {
    return buildUserSummary(context.params.user);
  },
  inviteToken: async() => uuidv4(),
  createdAt: async () => Date.now(),
  active: async () => true,
  result: async () => {},
})

// Schema for updating existing entries
export const orgInvitesPatchSchema = Type.Partial(orgInvitesSchema, {
  $id: 'OrgInvitesPatch'
})
export const orgInvitesPatchValidator = getValidator(orgInvitesPatchSchema, dataValidator)
export const orgInvitesPatchResolver = resolve({})

// Schema for allowed query properties
export const orgInvitesQueryProperties = Type.Pick(orgInvitesSchema, [
  '_id',
  'state',
  'toEmail',
  'organization',
  'active',
])
export const orgInvitesQuerySchema = Type.Intersect(
  [
    querySyntax(orgInvitesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const orgInvitesQueryValidator = getValidator(orgInvitesQuerySchema, queryValidator)
export const orgInvitesQueryResolver = resolve({})
