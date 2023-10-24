
export const isEndUser = async (context) => {
  const provider = context.params.provider; // Internal calls are "undefined"
  if (provider === undefined) {
    return false;
  }
  if (isAdminUser(context.params?.user)) {
    return false;
  } else {
    return true;
  }
}

export const isAdminUser = (user) => {
  let email = user?.email;
  let flag = user?.isTripe;
  if (flag === true && email.includes("@ondsel.com")) {
    return true;
  }
  return false;
}

