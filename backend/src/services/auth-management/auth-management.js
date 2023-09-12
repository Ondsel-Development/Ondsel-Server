import { authManagementPath } from './auth-management.shared.js'
import {AuthenticationManagementService} from "feathers-authentication-management";
import {notifier} from "./notifier.js";
import {authManagementSchema} from "./auth-management.schema.js";
import swagger from "feathers-swagger";

// A configure function that registers the service and its hooks via `app.configure`
export const authManagement = (app) => {
  // Register our service on the Feathers application
  app.use(
    authManagementPath,
    new AuthenticationManagementService(app, {
      notifier: notifier(app)
    }),
    {
      // A list of all methods this service exposes externally
      methods: ['create'],
      // You can add additional custom events to be sent to clients here
      events: [],
      docs: swagger.createSwaggerServiceOptions({
        schemas: { authManagementSchema },
        docs: {
          description: 'Managed Authentication Service',
          idType: 'string',
          securities: ['all'],
        }
      })
    }
  )

  // // Initialize hooks
  // app.service(authManagementPath).hooks({
  //   around: {
  //     all: []
  //   },
  //   before: {
  //     all: [
  //       disallow('external')
  //     ],
  //   },
  //   after: {
  //     all: [],
  //   },
  //   error: {
  //     all: []
  //   }
  // })
}
