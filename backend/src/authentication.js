// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import {CustomLocalStrategy} from "./custom-local-strategy.js";

export const authentication = (app) => {
  const authentication = new AuthenticationService(app, 'authentication', {
  })

  authentication.docs = authentication.docs = {
    idNames: {
      remove: 'accessToken',
    },
    idType: 'string',
    securities: ['remove', 'removeMulti'],
    multi: ['remove'],
    schemas: {
      authRequest: {
        type: 'object',
        properties: {
          strategy: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
      authResult: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          authentication: {
            type: 'object',
            properties: {
              strategy: { type: 'string' },
            },
          },
          payload: {
            type: 'object',
            properties: {}, // TODO
          },
          user: { $ref: '#/components/schemas/User' },
        },
      },
    },
    refs: {
      createRequest: 'authRequest',
      createResponse: 'authResult',
      removeResponse: 'authResult',
      removeMultiResponse: 'authResult',
    },
    operations: {
      remove: {
        description: 'Logout the currently logged in user',
        'parameters[0].description': 'accessToken of the currently logged in user',
      },
      removeMulti: {
        description: 'Logout the currently logged in user',
        parameters: [],
      },
    },
  };


  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new CustomLocalStrategy())

  app.use('authentication', authentication)
}
