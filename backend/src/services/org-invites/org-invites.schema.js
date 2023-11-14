// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { InviteNatureType, orgInvitesResultSchema } from "./org-invites.subdocs.schema.js";
import { userSummarySchema } from "../users/users.subdocs.schema.js";
import { buildUserSummary } from "../users/users.distrib.js";

// Main data model schema
export const orgInvitesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    inviteNature: InviteNatureType,
    inviteToken: Type.Optional(Type.String()),
    toEmail: Type.String({ format: "email"}),
    personInviting: userSummarySchema,
    createdAt: Type.Number(),
    organizationId: ObjectIdSchema(),
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
  'inviteNature',
  'toEmail',
  'organizationId'
], {
  $id: 'OrgInvitesData'
})
export const orgInvitesDataValidator = getValidator(orgInvitesDataSchema, dataValidator)
const TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const orgInvitesDataResolver = resolve({
  inviteToken: async() => {
    return [...Array(30)].reduce(a=>a+TOKEN_CHARS[~~(Math.random()*TOKEN_CHARS.length)],'');
  },
  personInviting: async (_value, _message, context) => {
    return buildUserSummary(context.params.user)
  },
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
  'inviteNature',
  'toEmail',
  'organizationId',
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
