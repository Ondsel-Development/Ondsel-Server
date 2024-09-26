import _ from 'lodash';

import {ConnectionTypeMap, SourceTypeMap} from '../user-engagements/user-engagement.subdocs.schema.js';

const eventNameMapping = {
  'authentication.create': 'LOGIN',
  'authentication.remove': 'LOGOUT',
  'workspaces.create': 'CREATE_WORKSPACE',
  'workspaces.get': 'FETCH_WORKSPACE',
  'workspaces.find': 'FETCH_WORKSPACE',
  'workspaces.remove': 'REMOVE_WORKSPACE',
  'organizations.create': 'CREATE_ORGANIZATION',
  'organizations.get': 'FETCH_ORGANIZATION',
  'organizations.find': 'FETCH_ORGANIZATION',
  'organizations.remove': 'REMOVE_ORGANIZATION',
  'shared-models.create': 'CREATE_SHARED-MODEL',
  'shared-models.get': 'FETCH_SHARED-MODEL',
  'shared-models.find': 'FETCH_SHARED-MODEL',
  'shared-models.patch': 'UPDATE_SHARED-MODEL',
  'shared-models.remove': 'REMOVE_SHARED-MODEL',
  'models.create': 'CREATE_MODEL',
  'models.get': 'FETCH_MODEL',
  'models.find': 'FETCH_MODEL',
  'models.remove': 'REMOVE_MODEL',
  'models.patch': 'UPDATE_MODEL',
  'preferences.create': 'CREATE_PREFERENCE',
  'preferences.get': 'FETCH_PREFERENCE',
  'preferences.find': 'FETCH_PREFERENCE',
  'preferences.remove': 'REMOVE_PREFERENCE',
  'file.create': 'CREATE_FILE',
  'file.get': 'FETCH_FILE',
  'file.find': 'FETCH_FILE',
  'file.remove': 'REMOVE_FILE',
  'directories.create': 'CREATE_DIRECTORIES',
  'directories.get': 'FETCH_DIRECTORIES',
  'directories.find': 'FETCH_DIRECTORIES',
  'directories.remove': 'REMOVE_DIRECTORIES',
  'keywords.find': 'SEARCH',
}

const eventsToTrack = {
  socketio: {
    authentication: ['create', 'remove'],
    workspaces: ['create', 'remove'],
    organizations: ['create', 'get', 'find', 'remove'],
    'shared-models': ['create', 'get', 'find', 'remove', 'patch'],
    models: ['create', 'get', 'find', 'remove', 'patch'],
    preferences: ['create', 'get', 'find', 'remove'],
    file: ['create', 'get', 'find', 'remove'],
    directories: ['create', 'remove'],
    keywords: ['find'],
  },
  rest: {
    authentication: ['create', 'remove'],
    workspaces: ['create', 'remove'],
    organizations: ['create', 'get', 'find', 'remove'],
    'shared-models': ['create', 'get', 'find', 'remove', 'patch'],
    models: ['create', 'get', 'find', 'remove', 'patch'],
    preferences: ['create', 'get', 'find', 'remove'],
    file: ['create', 'get', 'find', 'remove'],
    directories: ['create', 'remove'],
    keywords: ['find'],
  }
}

function canTrackEvent(provider, path, method, config = eventsToTrack) {
  return config.hasOwnProperty(provider) && config[provider].hasOwnProperty(path) && config[provider][path].includes(method);
}


const generateUserEngagementPayload = context => {
  const { path, method, params } = context;

  const getSource = () => {
    const source = _.get(params.headers, 'x-lens-source');
    if (source) {
      if (_.some(SourceTypeMap, v => v === source)) {
        return source;
      }
      return SourceTypeMap.unknown;
    }
    if (params.provider === ConnectionTypeMap.socketio) {
      // TODO: When whether socket connection with lens website or not. Skipping for now.
      return SourceTypeMap.lens;
    }
    return SourceTypeMap.unknown;
  }

  const version = _.get(params.headers, 'x-lens-version');

  const payload = {
    source: getSource(),
    path: path,
    method: method,
    connection: params.provider,
    ...(eventNameMapping.hasOwnProperty(`${path}.${method}`) && {event: eventNameMapping[`${path}.${method}`]}),
    ...(context.id && {contextId: context.id}),
    ...(!_.isEmpty(context.$userQuery) && {query: context.$userQuery}),
    ...(version && {version: version}),
    ...(!context.id && {contextId: context?.result?._id}),  // 'create' hook don't have context.id, so assigning from result
    ...(!_.isEmpty(context.$userPayload) && {payload: context.$userPayload}),
  };
  return payload;
}


export const createUserEngagementEntry = async context => {
  const getUser = () => {
    if (path === 'authentication' && method === 'create') {
      return context.result.user;
    }
    return context.params.user;
  }

  const userEngagementService = context.app.service('user-engagements');
  const { path, method, params } = context;
  const user = getUser();

  if (canTrackEvent(params.provider, path, method, eventsToTrack)) {
    const payload = generateUserEngagementPayload(context);
    if (user) {
      const ue = await userEngagementService.create(payload, { user: user });
    }
  }
}

export async function createUserEngagementEntryForPublisherDownload(publishedDetails, userId, app) {
  // because this is called from expressJS-style middleware, we have no 'context'.
  const userEngagementService = app.service('user-engagements');
  const userService = app.service('users');
  const user = await userService.get(userId);
  const falseContext = {
    id: publishedDetails._id,
    path: 'publisher',
    method: 'get', // it's really a POST, but this makes more sense in context
    params: {
      provider: ConnectionTypeMap.socketio,
    },
  }
  const payload = generateUserEngagementPayload(falseContext);
  const ue = await userEngagementService.create(payload, { user: user });
}

export const saveContextQueryState = context => {
  context.$userQuery = context.params.query;
  return context;
}

export const saveContextPayloadState = context => {
  context.$userPayload = context.data;
  return context;
}
