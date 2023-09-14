import {LocalStrategy} from "@feathersjs/authentication-local";
import {NotAuthenticated} from "@feathersjs/errors";


export class CustomLocalStrategy extends LocalStrategy {
  async findEntity(username, params) {
    // console.log(JSON.stringify(params));
    const result = await super.findEntity(username, params);
    // console.log(JSON.stringify(result));
    return result;
  }
  async getEntityQuery(query, params){
    const result = await super.getEntityQuery(query, params);
    // console.log(JSON.stringify(result));
    return result;
  }
  async comparePassword(entity, password) {
    // console.log(JSON.stringify(entity));
    const originalAnswer = await super.comparePassword(entity, password);
    if (entity.isVerified === false) {
      throw new NotAuthenticated("AEV - account email not verified yet");
    }
    return originalAnswer;
  }
  async authenticate(authentication, params) {
    // console.log(JSON.stringify(result));
    console.log("HERE HERE");
    console.log(JSON.stringify(params));
    const result = await super.authenticate(authentication, params);
    return result;
  }
}
