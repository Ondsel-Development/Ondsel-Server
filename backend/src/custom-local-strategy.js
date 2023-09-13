import {LocalStrategy} from "@feathersjs/authentication-local";
import {NotAuthenticated} from "@feathersjs/errors";


export class CustomLocalStrategy extends LocalStrategy {
  async comparePassword(entity, password) {
    if (entity.isVerified === false) {
      throw new NotAuthenticated("AEV - account email not verified yet");
    }
    return super.comparePassword(entity, password);
  }
}
