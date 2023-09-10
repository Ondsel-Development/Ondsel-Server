import { emailPath } from './email.shared.js'
import { EmailService } from "./email.class.js";
import swagger from "feathers-swagger";
import {emailSchema} from "./email.schema.js";

// A configure function that registers the service and its hooks via `app.configure`
export const email = (app) => {

  let transporter = {
    host: app.get('smtpHost'),
    port: app.get('smtpPort'),
    secure: true,
    auth: {
      user: app.get('smtpUser'),
      pass: app.get('smtpPass'),
    }
  }

  // Register our service on the Feathers application
  app.use(
    emailPath,
    new EmailService(transporter, { from: app.get('smtpUser') }),
    {
      // A list of all methods this service exposes externally
      methods: ['create'],
      // You can add additional custom events to be sent to clients here
      events: [],
      docs: swagger.createSwaggerServiceOptions({
        schemas: { emailSchema },
        docs: {
          description: 'Internal email service',
          idType: 'string',
          securities: ['all'],
        }
      })
    }
  )

  // Initialize hooks
  app.service(emailPath).hooks({
    around: {
      all: [],
    },
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      patch: [],
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
