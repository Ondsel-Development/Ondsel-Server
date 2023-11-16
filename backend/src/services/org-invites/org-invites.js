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

export * from './org-invites.class.js'
export * from './org-invites.schema.js'

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
        isLoggedInUserOwnerOrAdminOfOrganization,
        validateExtraCreateDetails,
      ],
      patch: [
        schemaHooks.validateData(orgInvitesPatchValidator),
        schemaHooks.resolveData(orgInvitesPatchResolver),
        validateExtraPatchDetails,
        doAddUserToOrganization,
        sendOrgInviteConfirmation,
      ],
      remove: []
    },
    after: {
      all: [],
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
    personInviting: context.result.personInviting,
    organization: context.result.organization,
  }
  await notifierInst(orgInviteStateTypeMap.sendOrgInviteEmail, details);
  return context;
}
const sendOrgInviteConfirmation = async context => {
  if (context.result.state !== orgInviteStateTypeMap.verifyOrgInviteEmail) {
    return context;
  }
  const notifierInst = notifier(context.app);
  const details = {
    inviteId: context.result._id, // not used
    email: context.data.userDetail.email,
    organization: buildOrganizationSummary(context.data.orgDetail),
  }
  await notifierInst(orgInviteStateTypeMap.sendOrgInviteEmail, details);
  return context;
}

export const validateExtraPatchDetails = async (context) => {
  switch (context.data.state) {
    case orgInviteStateTypeMap.cancelOrgInvite:
      if (!context.data.result) {
        context.data.result = {}
      }
      // setting the date and making active=false are the only real "actions" from cancelling an invitation.
      // The "cancelledByUserId" and "notes" are ideally set, but not strictly required.
      context.data.result.acceptedAt = Date.now(); // override anything sent; server sets this officially
      context.data.active = false;
      break;
    case orgInviteStateTypeMap.verifyOrgInviteEmail:
      context.data.active = false;
      break;
    default:
      throw new BadRequest('Invalid: authAction not allowed on PUT');
  }
}
export const validateExtraCreateDetails = async (context) => {
  if (orgInviteStateTypeMap.sendOrgInviteEmail !== context.data.state) {
    throw new BadRequest('Invalid: authAction not allowed on POST')
  }
}

export const isLoggedInUserOwnerOrAdminOfOrganization = async context => {
  const organization = await context.app.service('organizations').get(context.data.organization._id);

  if (
    context.params.user._id.equals(organization.createdBy)
    || organization.users.some(user => user._id.equals(context.params.user._id.toString()) && user.isAdmin)) {
    return context;
  }
  throw new BadRequest('Only admins of organization allow to perform this action');
}

