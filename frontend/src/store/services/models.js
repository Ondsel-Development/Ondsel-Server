import feathersClient, { makeServicePlugin, BaseModel } from '@/plugins/feathers-client'

class Model extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Model'
  // Define default properties here
  static instanceDefaults() {
    return {
      uniqueFileName: '',
      custFileName: undefined,
      shouldStartObjGeneration: false,
      isObjGenerationInProgress: false,
      isObjGenerated: false,
      errorMsg: '',
    }
  }

  get customerFileName() {
    return this.custFileName || this.file?.custFileName;
  }
  // generatedObjUrl() {
  //   if (this.isObjGenerated) {
  //     const res = this.get(this._id);
  //     return res.generatedObjUrl;
  //   }
  //   return ''
  // }
}
const servicePath = 'models'
const servicePlugin = makeServicePlugin({
  'Model': Model,
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
