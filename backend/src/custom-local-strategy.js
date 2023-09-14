import {LocalStrategy} from "@feathersjs/authentication-local";
import {NotAuthenticated} from "@feathersjs/errors";

// This custom authentication strategy simply adds a check for "isVerified" to the "local" password check.

export class CustomLocalStrategy extends LocalStrategy {
  async comparePassword(entity, password) {
    // console.log(JSON.stringify(entity));
    const originalAnswer = await super.comparePassword(entity, password);
    if (entity.isVerified === false) {
      // The "AEV" prefix makes it easier to detect this specific error message by the frontend
      throw new NotAuthenticated("AEV - account email not verified yet");
    }
    return originalAnswer;
  }
}
