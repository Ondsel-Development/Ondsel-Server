// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  groupDataValidator,
  groupPatchValidator,
  groupQueryValidator,
  groupResolver,
  groupExternalResolver,
  groupDataResolver,
  groupPatchResolver,
  groupQueryResolver,
  groupSchema,
  groupDataSchema,
  groupPatchSchema,
  groupQuerySchema,
} from './groups.schema.js'
import { GroupService, getOptions } from './groups.class.js'
import { groupPath, groupMethods } from './groups.shared.js'
import {iff, preventChanges} from "feathers-hooks-common";
import { addUsersToGroup } from './commands/addUsersToGroup.js';
import { removeUsersFromGroup } from './commands/removeUsersFromGroup.js';
import { isUserOwnerOrAdminOfOrganization } from './helpers.js';

export * from './groups.class.js'
export * from './groups.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const group = (app) => {
  // Register our service on the Feathers application
  app.use(groupPath, new GroupService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: groupMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { groupSchema, groupDataSchema, groupPatchSchema , groupQuerySchema, },
      docs: {
        description: 'A Group service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(groupPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(groupExternalResolver),
        schemaHooks.resolveResult(groupResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(groupQueryValidator), schemaHooks.resolveQuery(groupQueryResolver)],
      find: [userBelongingGroups],
      get: [userBelongingGroups],
      create: [schemaHooks.validateData(groupDataValidator), schemaHooks.resolveData(groupDataResolver)],
      patch: [
        preventChanges(false, 'users'),
        isUserOwnerOrAdminOfOrganization,
        iff(
          context => context.data.shouldAddUsersToGroup,
          addUsersToGroup
        ),
        iff(
          context => context.data.shouldRemoveUsersFromGroup,
          removeUsersFromGroup
        ),
        schemaHooks.validateData(groupPatchValidator),
        schemaHooks.resolveData(groupPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}


const userBelongingGroups = async context => {
  const userOrganizations = context.params.user.organizations || []
  context.params.query.organizationId = {
    $in: userOrganizations.map(org => org._id)
  }
  return context;
}
