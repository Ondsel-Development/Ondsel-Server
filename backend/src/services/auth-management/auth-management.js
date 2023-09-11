import { authManagementPath } from './auth-management.shared.js'
import {addVerification, AuthenticationManagementService, removeVerification} from "feathers-authentication-management";
import {notifier} from "./notifier.js";
import {authenticate} from "@feathersjs/authentication";
import {discard, iff, isProvider} from "feathers-hooks-common";
import {authManagementSchema} from "./auth-management.schema.js";
import swagger from "feathers-swagger";

const sendVerify = () => {
  return async (context) => {
    const notifierInst = notifier(context.app);

    const users = Array.isArray(context.result)
      ? context.result
      : [context.result];

    await Promise.all(
      users.map(async user => notifierInst("resendVerifySignup", user))
    )
  };
}

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

  // Initialize hooks
  app.service(authManagementPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [authenticate("jwt")],
      get: [authenticate("jwt")],
      create: [addVerification("auth-management")], // removed hashPassword("password"),
      update: [authenticate("jwt")], // removed hashPassword("password"),
      patch: [authenticate("jwt")], // removed hashPassword("password"),
      remove: [authenticate("jwt")]
    },
    after: {
      all: [
        iff(isProvider('external'), discard("password"))
        // protect("password"), // removed
      ],
      find: [],
      get: [],
      create: [
        sendVerify(),
        removeVerification()
      ],
      update: [],
      patch: [],
      remove: []
    },
    error: {
      all: []
    }
  })
}
