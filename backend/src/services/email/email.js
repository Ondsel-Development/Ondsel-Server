import { authenticate } from '@feathersjs/authentication'
import { emailPath } from './email.shared.js'
import { EmailService } from "./email.class.js";
import nodemailer from "nodemailer";

// A configure function that registers the service and its hooks via `app.configure`
export const email = (app) => {

  let transporter = nodemailer.createTransport({
    host: app.get('smtpHost'),
    port: app.get('smtpPort'),
    secure: true,
    auth: {
      user: app.get('smtpUser'),
      pass: app.get('smtpPass'),
    }
  })

  // Register our service on the Feathers application
  app.use(
    emailPath,
    new EmailService(transporter, { from: app.get('smtpUser') })
  )
  // Initialize hooks
  app.service(emailPath).hooks({
    around: {
      all: [authenticate('jwt')]
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
