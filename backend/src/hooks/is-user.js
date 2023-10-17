import {isProvider} from "feathers-hooks-common";

export const isEndUser = async (context) => {
  let externalFlag = await isProvider('external');
  if (externalFlag) {
    if (isAdminUser(context.params?.user)) {
      return false;
    } else {
      return true;
    }
  }
  return false;
}

export const isAdminUser = (user) => {
  let email = user?.email;
  let flag = user?.isTripe;
  if (flag === true && email.includes("@ondsel.com")) {
    return true;
  }
  return false;
}