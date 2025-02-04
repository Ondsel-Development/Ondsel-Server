// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import {disallow, iff, isProvider, preventChanges} from 'feathers-hooks-common';

import { hooks as schemaHooks } from '@feathersjs/schema'
import { handlePaginateQuery } from '../../hooks/handle-paginate-query.js';
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
import {
  canUserGetOrgSecondaryReferences,
  canUserPatchOrgSecondaryReferences,
  limitOrgSecondaryReferencesToUser
} from './helpers.js';
import swagger from "feathers-swagger";
import { addBookmark } from './commands/addBookmark.js';
import { removeBookmark } from './commands/removeBookmark.js';
import {addShare} from "./commands/addShare.js";
import {removeShare} from "./commands/removeShare.js";
import {editShare} from "./commands/editShare.js";

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

  app.service(orgSecondaryReferencesPath).publish((data, context) => {
    return app.channel(`organization/${context.result.organizationId.toString()}`);
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
        handlePaginateQuery,
        schemaHooks.validateQuery(orgSecondaryReferencesQueryValidator),
        schemaHooks.resolveQuery(orgSecondaryReferencesQueryResolver)
      ],
      find: [
        iff(isProvider('external'), limitOrgSecondaryReferencesToUser),
      ],
      get: [
        iff(isProvider('external'), canUserGetOrgSecondaryReferences),
      ],
      create: [
        disallow('external'),
        schemaHooks.validateData(orgSecondaryReferencesDataValidator),
        schemaHooks.resolveData(orgSecondaryReferencesDataResolver)
      ],
      patch: [
        iff(isProvider('external'), canUserPatchOrgSecondaryReferences),
        iff(isProvider('external'), preventChanges(true, 'organizationId', 'bookmarks')),
        iff(
          context => context.data.shouldAddBookmark,
          addBookmark,
        ),
        iff(
          context => context.data.shouldRemoveBookmark,
          removeBookmark,
        ),
        iff(
          context => context.data.shouldAddShare,
          addShare,
        ),
        iff(
          context => context.data.shouldEditShare,
          editShare,
        ),
        iff(
          context => context.data.shouldRemoveShare,
          removeShare,
        ),
        // TODO: in the future: add shouldAddPromotion and shouldRemovePromotion to this collection and endpoint
        schemaHooks.validateData(orgSecondaryReferencesPatchValidator),
        schemaHooks.resolveData(orgSecondaryReferencesPatchResolver)
      ],
      remove: [
        disallow('external'),
      ]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
