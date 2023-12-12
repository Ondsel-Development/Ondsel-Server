// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';
import axios from 'axios';
import {iff, preventChanges} from 'feathers-hooks-common'
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver,
  userSchema,
  userDataSchema,
  userQuerySchema,
  uniqueUserValidator, uniqueUserPatchValidator
} from './users.schema.js'
import { UserService, getOptions } from './users.class.js'
import { userPath, userMethods } from './users.shared.js'
import {addVerification, removeVerification} from "feathers-authentication-management";
import {notifier} from "../auth-management/notifier.js";
import { isEndUser } from "../../hooks/is-user.js";

export * from './users.class.js'
export * from './users.schema.js'


// A configure function that registers the service and its hooks via `app.configure`
export const user = (app) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { userDataSchema, userQuerySchema, userSchema },
      docs: {
        description: 'A User model service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  app.service(userPath).publish((data, context) => {
    return app.channel(context.result._id.toString())
  })
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        uniqueUserValidator,
        addVerification("auth-management"),
      ],
      patch: [
        preventChanges(
          false,
          'isTripe',
        ),
        iff(
          isEndUser,
          preventChanges(
            false,
            'tier',
            'nextTier',
            'subscriptionDetail.state',
            'organizations',
            "isVerified",
            "resetExpires",
            "resetShortToken",
            "resetToken",
            "verifyChanges",
            "verifyExpires",
            "verifyShortToken",
            "verifyToken",
          ),
          schemaHooks.validateData(userPatchValidator),
          uniqueUserPatchValidator,
        ),
        schemaHooks.resolveData(userPatchResolver),
      ],
      remove: []
    },
    after: {
      all: [],
      create: [
        sendVerify(),
        removeVerification(),
        createDefaultOrganization,
        createSampleModels,
        sendNotificationToSlack,
      ],
    },
    error: {
      all: []
    }
  })
}


const createSampleModels = async (context) => {
  const sampleModelFileName = 'ondsel.FCStd';
  const sampleModelObj = 'ondsel_generated.OBJ';
  const sampleModelThumbnail = 'public/ondsel_thumbnail.PNG';
  const attributes = {
    "Fillet1": {
      "type": "length",
      "value": 20,
      "unit": "mm"
    },
    "Fillet2": {
      "type": "length",
      "value": 5,
      "unit": "mm"
    },
    "NumberOfCircles": {
      "type": "number",
      "value": 2,
      "unit": ""
    },
    "RadialDistance": {
      "type": "length",
      "value": 1000,
      "unit": "mm"
    },
    "TangentialDistance": {
      "type": "length",
      "value": 1000,
      "unit": "mm"
    },
    "Thickness": {
      "type": "length",
      "value": 80,
      "unit": "mm"
    }
  }

  const { app } = context;
  const modelService = app.service('models');
  const fileService = app.service('file');
  const uploadService = app.service('upload');

  try {
    const file = await fileService.create({
      custFileName: 'Ondsel.FCStd',
      shouldCommitNewVersion: true,
      version: {
        uniqueFileName: sampleModelFileName,
      }
    }, { user: { _id: context.result._id }})

    const model  = await modelService.create({
      fileId: file._id.toString(),
      attributes: attributes,
      isObjGenerated: true,
      isThumbnailGenerated: true,
    }, { user: { _id: context.result._id }, skipSystemGeneratedSharedModel: true })

    await uploadService.copy(sampleModelThumbnail, sampleModelThumbnail.replace('ondsel', model._id.toString()));
    await uploadService.copy(sampleModelObj, sampleModelObj.replace('ondsel', model._id.toString()));
  } catch (e) {
    console.error(e);
  }

  return context
}

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

const createDefaultOrganization = async context => {
  const organizationService = context.app.service('organizations');
  const workspaceService = context.app.service('workspaces');
  const organization = await organizationService.create({ name: 'Personal', refName: context.result._id.toString() }, { user: context.result });
  const workspace = await workspaceService.create(
    { name: 'Default', description: 'Your workspace', organizationId: organization._id, refName: context.result._id.toString() },
    { user: context.result }
  )
  await context.service.patch(context.result._id, { defaultWorkspaceId: workspace._id });
  return context;
}


const sendNotificationToSlack = async context => {
  const webhookUrl = context.app.get('slackWebhookUrl');
  if (webhookUrl) {
    axios({
      method: 'post',
      url: webhookUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        text: `🎉 New User Alert! 🎉\n\nName: *${context.result.name}*\nEmail: *${context.result.email}*`
      }
    });
  }
  return context;
}