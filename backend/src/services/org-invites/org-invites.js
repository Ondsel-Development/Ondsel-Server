// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  orgInvitesDataValidator,
  orgInvitesPatchValidator,
  orgInvitesQueryValidator,
  orgInvitesResolver,
  orgInvitesExternalResolver,
  orgInvitesDataResolver,
  orgInvitesPatchResolver,
  orgInvitesQueryResolver, orgInvitesSchema
} from './org-invites.schema.js'
import { OrgInvitesService, getOptions } from './org-invites.class.js'
import { orgInvitesPath, orgInvitesMethods } from './org-invites.shared.js'
import swagger from "feathers-swagger";
import { notifier } from "../auth-management/notifier.js";
import { BadRequest } from "@feathersjs/errors";
import { doAddUserToOrganization } from "./hooks/DoAddUserToOrganization.js";
import { buildOrganizationSummary } from "../organizations/organizations.distrib.js";
import { orgInviteStateTypeMap } from "./org-invites.subdocs.schema.js";
import { iff, isProvider } from "feathers-hooks-common";

export * from './org-invites.class.js'
export * from './org-invites.schema.js'

/*
Examples of use

For creation with POST. User generating the invite is logged in.:

  {
    "state": "sendOrgInviteEmail",
    "toEmail": "john@cattailcreek9.com",
    "organization": {
      "_id": "65567d7d0dc31ea4aeee307d",
      "name": "pool company"
    }
  }

For accepting and invite with a PATCH /org-invites/6557efc97854628b50509ddd. USER accepting the invite is logged in.

  {
    "state": "verifyOrgInviteEmail",
    "passedTokenConfirmation": "c2b0e42b-fb7c-4eb0-b77c-a76852f42d5d",
    "result": {
      "note": "On web interface, user john_something accept invite to pool company."
    }
  }

The "result" part is optional. The date/time of handling and log is set in the result object by the API.
The users official Ondsel email address is used for the confirmation email, regardless of the invitation address.

For a user rejecting an invite (or an org member cancelling and invite) with a PAtCH. USER taking action must be logged
in:

  {
    "state": "cancelOrgInvite",
    "result": {
      "note": "larry of pool_company cancelled the invite"
    }
  }

The "result" part is optional but a good idea. The date/time of handling and log is set in the result object by the API.

*/


// A configure function that registers the service and its hooks via `app.configure`
export const orgInvites = (app) => {
  // Register our service on the Feathers application
  app.use(orgInvitesPath, new OrgInvitesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: orgInvitesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { orgInvitesSchema },
      docs: {
        description: 'An service handling inviting users to an organization',
        idType: 'string',
        securities: ['all'],
      }
    }),
  })
  // Initialize hooks
  app.service(orgInvitesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(orgInvitesExternalResolver),
        schemaHooks.resolveResult(orgInvitesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(orgInvitesQueryValidator),
        schemaHooks.resolveQuery(orgInvitesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(orgInvitesDataValidator),
        schemaHooks.resolveData(orgInvitesDataResolver),
        getOrgDetails,
        isLoggedInUserOwnerOrAdminOfInvitableOrganization,
        validateExtraCreateDetails,
      ],
      patch: [
        schemaHooks.validateData(orgInvitesPatchValidator),
        schemaHooks.resolveData(orgInvitesPatchResolver),
        getInviteDetails, // never trust a patch for truth
        getOrgDetails,
        validateExtraPatchDetails,
        doAddUserToOrganization,
        sendOrgInviteConfirmation,
      ],
      remove: []
    },
    after: {
      all: [],
      get: [
        iff(
          isProvider('external'),
          blockSecurityDetails,
        )
      ],
      create: [sendOrgInvitation],
    },
    error: {
      all: []
    }
  })
}

const sendOrgInvitation = async context => {
  const notifierInst = notifier(context.app);
  const details = {
    inviteId: context.result._id,
    email: context.result.toEmail,
    inviteToken: context.result.inviteToken,
    organization: buildOrganizationSummary(context.dbref.organization),
  }
  await notifierInst(orgInviteStateTypeMap.sendOrgInviteEmail, details);
  return context;
}
const blockSecurityDetails = async context => {
  context.result.inviteToken = "/redacted/";
  context.result.passedTokenConfirmation = "/redacted/";
  context.result.toEmail = "/redacted/";
  return context;
}
const sendOrgInviteConfirmation = async context => {
  if (context.data.state !== orgInviteStateTypeMap.verifyOrgInviteEmail) {
    return context;
  }
  const notifierInst = notifier(context.app);
  const details = {
    email: context.dbref.user.email, // using actual USER's email, not the invitation email
    organization: buildOrganizationSummary(context.dbref.organization),
  }
  await notifierInst(orgInviteStateTypeMap.verifyOrgInviteEmail, details);
  return context;
}

export const validateExtraPatchDetails = async (context) => {
  if (context.dbref.invite.active === false) {
    throw new BadRequest("Invalid: invite already inactive.");
  }
  if (!context.data.result) {
    context.data.result = {}
  }
  switch (context.data.state) {
    case orgInviteStateTypeMap.cancelOrgInvite:
      // setting the date and making active=false are the only real "actions" from cancelling an invitation.
      // The result."notes" are ideally set, but not strictly required.
      context.data.result.cancelledByUserId = context.params.user._id;
      context.data.result.handledAt = Date.now(); // override anything sent; server sets this officially
      context.data.active = false;
      context.data.result.log = "invite set active=false";
      break;
    case orgInviteStateTypeMap.verifyOrgInviteEmail:
      context.data.result.handledAt = Date.now(); // override anything sent; server sets this officially
      context.data.active = false;
      break;
    default:
      throw new BadRequest('Invalid: state "${context.data.state}" not allowed on PATCH');
  }
  return context;
}
export const validateExtraCreateDetails = async (context) => {
  if (orgInviteStateTypeMap.sendOrgInviteEmail !== context.data.state) {
    throw new BadRequest(`Invalid: state "${context.data.state}" not allowed on POST`)
  }
}

export const isLoggedInUserOwnerOrAdminOfInvitableOrganization = async context => {
  const organization = context.dbref.organization;
  if (
    context.params.user._id.equals(organization.createdBy)
    || organization.users.some(user => user._id.equals(context.params.user._id.toString()) && user.isAdmin)) {
    return context;
  }
  throw new BadRequest('Only admins of organization allow to perform this action');
}

export const getOrgDetails = async context => {
  let orgId = context.data.organization?._id;
  if (context.dbref?.invite) {
    orgId = context.dbref.invite.organization._id; // if we have authoritative answer, use it instead
  }
  const organization = await context.app.service('organizations').get(orgId);
  if (!organization) {
    throw new BadRequest(`Cannot find org ${orgId}`);
  }
  if (!context.dbref) {
    context.dbref = {};
  }
  context.dbref.organization = organization;
}
export const getInviteDetails = async context => {
  const invite = await context.app.service('org-invites').get(context.id);
  if (!invite) {
    throw new BadRequest(`Cannot find invite ${context.id}`);
  }
  if (!context.dbref) {
    context.dbref = {};
  }
  context.dbref.invite = invite;
}
