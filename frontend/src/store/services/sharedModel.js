import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

export const ProtectionTypeMap = {
  listed: 'Listed',
  unlisted: 'Unlisted',
  pin: 'Pin',
  direct: 'Direct',
}

class SharedModel extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'SharedModel'
  // Define default properties here
  static instanceDefaults() {
    return {
      cloneModelId: '',
      description: '',
      protection: ProtectionTypeMap.unlisted,
      canViewModel: true,
      canViewModelAttributes: false,
      canUpdateModel: false,
      canExportFCStd: false,
      canExportSTEP: false,
      canExportSTL: false,
      canExportOBJ: false,
      canDownloadDefaultModel: false,
    }
  }

  get showInPublicGallery() {
    return this.protection === ProtectionTypeMap.listed;
  }
}
const servicePath = 'shared-models'
const servicePlugin = makeServicePlugin({
  'Model': SharedModel,
  service: feathersClient.service(servicePath),
  servicePath
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default servicePlugin
