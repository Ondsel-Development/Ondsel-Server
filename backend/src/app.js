// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import express, {
  rest,
  json,
  urlencoded,
  cors,
  serveStatic,
  notFound,
  errorHandler
} from '@feathersjs/express'
import configuration from '@feathersjs/configuration'
import socketio from '@feathersjs/socketio'
import swagger from 'feathers-swagger';
import { iff, isProvider } from 'feathers-hooks-common';
import {createUserEngagementEntry, saveContextQueryState, saveContextPayloadState} from './services/hooks/userEngagements.js';

import { configurationValidator } from './configuration.js'
import { logger } from './logger.js'
import { logError } from './hooks/log-error.js'
import { mongodb } from './mongodb.js'

import { authentication } from './authentication.js'

import { services } from './services/index.js'
import { channels } from './channels.js'
import { registerCustomMiddlewares } from './custom-middlewares.js';

const app = express(feathers())

// Load app configuration
app.configure(configuration(configurationValidator))
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
// Host the public folder
app.use('/', serveStatic(app.get('public')))

// Configure services and real-time functionality
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(mongodb)


app.configure(swagger({
  ui: swagger.swaggerUI({}),
  specs: {
    info: {
      title: 'Ondsel Server API',
      description: 'API documentation for Ondsel backend API',
      version: '1.0.0',
    },
    schemes: ['http', 'https'], // Optionally set the protocol schema used (sometimes required when host on https)
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },

}));

app.configure(authentication)

app.configure(services)
app.configure(channels)

// Custom middlewares
registerCustomMiddlewares(app);
// Configure a middleware for 404s and the error handler
app.use(notFound())
app.use(errorHandler({ logger }))

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {
    all: [
      saveContextQueryState,
      saveContextPayloadState,
    ],
  },
  after: {
    all: [
      iff(isProvider('external'), createUserEngagementEntry),
    ],
    create: [
    ],
  },
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
