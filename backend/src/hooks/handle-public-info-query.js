// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {resolveResult} from "@feathersjs/schema";
import {authenticate} from "@feathersjs/authentication";
import axios from "axios";
import {notifier} from "../services/auth-management/notifier.js";
import {BadRequest} from "@feathersjs/errors";

export const handlePublicOnlyQuery = (publicFields) => {
  return async (context, next) => {
    // this is an "around" hook
    // looks for the "publicInfo" query parameter. If found at all and set to "true", then
    // context.publicDataOnly is set to true else it is set to false.
    // the 'publicInfo' entry is then removed from query to prevent the parameter from being seen elsewhere.
    if (context.params?.query?.publicInfo === "true") {
      delete context.params.query.publicInfo;
      context.publicDataOnly = true
      context.params.query.$select = publicFields;
    } else {
      context.publicDataOnly = false
    }
    await next();
    return context;
  }
}

export const resolvePrivateResults = (resolver) => {
  // this is an "around" hook
  return async (context, next) => {
    if (context.publicDataOnly === true) {
      await next()
    } else {
      await resolveResult(resolver)(context, next);
    }
    return context;
  }
}

export const authenticateJwtWhenPrivate = () => {
  // this is an "around" hook
  return async (context, next) => {
    if (context.publicDataOnly === true) {
      await next()
    } else {
      await authenticate("jwt")(context, next);
    }
    return context;
  }
}


export const ThrowBadRequestIfNotForPublicInfo = async (context) => {
  if (context.publicDataOnly === false) {
    throw new BadRequest('Only public information queries allowed.');
  }
  return context;
}


export const tryToAuthenticate = () => {
  // this is an "around" hook
  // Try To authenticate context but also allow anonymous calls
  return async (context, next) => {
    try {
      await authenticate("jwt")(context, next);
    } catch (e) {
      console.log(e);
      await next();
    }
    return context;
  }
}