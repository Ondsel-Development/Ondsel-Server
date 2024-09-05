// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  publisherDataValidator,
  publisherPatchValidator,
  publisherQueryValidator,
  publisherResolver,
  publisherExternalResolver,
  publisherDataResolver,
  publisherPatchResolver,
  publisherQueryResolver
} from './publisher.schema.js'
import { PublisherService, getOptions } from './publisher.class.js'
import { publisherPath, publisherMethods } from './publisher.shared.js'
import {disallow, softDelete} from "feathers-hooks-common";
import {verifyOndselAdministrativePower} from "../hooks/administration.js";

export * from './publisher.class.js'
export * from './publisher.schema.js'

// how this API is used:
//
// An employee downloads all the release or weekly binaries from GitHub into a directory.
//
// They then visit the correct Xavier page and upload each binary via a form. This does an upload to S3 via the
// Lens API downloads endpoint that also contains the details of the nature/sha256/cadence/etc. The API itself does
// a POST (create) is made to the publisher endpoint with the details. For the specific nature/sha256/cadence, all
// previous entries are administratively soft deleted.
//
// When a user visit the download page, the page does a blank find of the all the publisher documents. This only
// returns the active files and shows those along with the lens download URL. This page places a "ouid" cookie into
// the browser session that contains a mildly obscured version of their userId (a hex string) (NOT username, just the
// hex index). Since that ID isn't really private, I'm not too concerned about it.
//
// The download links will look like this:
//   `https://lens.ondsel.com/published/2024.2.2/Ondsel_ES-2024.2.2.37240-Windows-x86_64-installer.exe`
//
// When the user downloads that URL, NGINX will catch the "/published" link and do two things:
//
//  - read the cookie from the headers and use LUA to post a "user-engagement" record to the API with the user id.
//  - establish a proxy to the S3 link. Since both S3 and our NGINX server are both on AWS, there is no traffic charge.
//
// From the user's perspective, they are directly downloading from Lens.
//
// If the user does not have a live session cookie, then NGINX will send a 404. So copying the download URL and trying it elsewhere will not work.
//
// A seasoned hacker could bypass this by inspecting header data and artificially scripting a mock header session, but that is way beyond the skill set of 99.9% of our users.

// A configure function that registers the service and its hooks via `app.configure`
export const publisher = (app) => {
  // Register our service on the Feathers application
  app.use(publisherPath, new PublisherService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: publisherMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(publisherPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(publisherExternalResolver),
        schemaHooks.resolveResult(publisherResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(publisherQueryValidator),
        schemaHooks.resolveQuery(publisherQueryResolver)
      ],
      find: [
        softDelete(),
      ],
      get: [
        disallow(),
      ],
      create: [
        verifyOndselAdministrativePower,
        softDelete(),
        schemaHooks.validateData(publisherDataValidator),
        schemaHooks.resolveData(publisherDataResolver)
      ],
      patch: [
        disallow(),
        // schemaHooks.validateData(publisherPatchValidator),
        // schemaHooks.resolveData(publisherPatchResolver)
      ],
      remove: [
        disallow('external'),
        softDelete(),
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
