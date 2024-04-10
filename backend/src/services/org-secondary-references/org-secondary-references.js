// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff, isProvider, preventChanges } from 'feathers-hooks-common';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  orgSecondaryReferencesDataValidator,
  orgSecondaryReferencesPatchValidator,
  orgSecondaryReferencesQueryValidator,
  orgSecondaryReferencesResolver,
  orgSecondaryReferencesExternalResolver,
  orgSecondaryReferencesDataResolver,
  orgSecondaryReferencesPatchResolver,
  orgSecondaryReferencesQueryResolver,
  orgSecondaryReferencesSchema,
  orgSecondaryReferencesDataSchema,
  orgSecondaryReferencesPatchSchema,
  orgSecondaryReferencesQuerySchema,
} from './org-secondary-references.schema.js'
import { OrgSecondaryReferencesService, getOptions } from './org-secondary-references.class.js'
import {
  orgSecondaryReferencesPath,
  orgSecondaryReferencesMethods
} from './org-secondary-references.shared.js'
import { canUserPatchOrgSecondaryReferences } from './helpers.js';
import swagger from "feathers-swagger";

export * from './org-secondary-references.class.js'
export * from './org-secondary-references.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const orgSecondaryReferences = (app) => {
  // Register our service on the Feathers application
  app.use(orgSecondaryReferencesPath, new OrgSecondaryReferencesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: orgSecondaryReferencesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { orgSecondaryReferencesSchema, orgSecondaryReferencesDataSchema, orgSecondaryReferencesPatchSchema, orgSecondaryReferencesQuerySchema, },
      docs: {
        description: 'An organization secondary references service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(orgSecondaryReferencesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(orgSecondaryReferencesExternalResolver),
        schemaHooks.resolveResult(orgSecondaryReferencesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(orgSecondaryReferencesQueryValidator),
        schemaHooks.resolveQuery(orgSecondaryReferencesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(orgSecondaryReferencesDataValidator),
        schemaHooks.resolveData(orgSecondaryReferencesDataResolver)
      ],
      patch: [
        iff(isProvider('external'), canUserPatchOrgSecondaryReferences),
        iff(isProvider('external'), preventChanges(true, 'organizationId', 'bookmarks')),
        schemaHooks.validateData(orgSecondaryReferencesPatchValidator),
        schemaHooks.resolveData(orgSecondaryReferencesPatchResolver)
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
