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
import {acceptAgreementSchema} from "../agreements/accept/accept.schema.js";
import {notifier} from "../auth-management/notifier.js";
import {authManagementActionTypeMap} from "../auth-management/auth-management.schema.js";
import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {InviteNatureType, orgInvitesResultSchema} from "./org-invites.subdocs.schema.js";
import {userSummarySchema} from "../users/users.subdocs.schema.js";
import axios from "axios";

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
        schemaHooks.resolveData(orgInvitesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(orgInvitesPatchValidator),
        schemaHooks.resolveData(orgInvitesPatchResolver)
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

  await notifierInst(authManagementActionTypeMap.sendOrgInviteEmail, details);
  return context;
}
