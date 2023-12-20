import {resolveResult} from "@feathersjs/schema";
import {authenticate} from "@feathersjs/authentication";
import axios from "axios";
import {notifier} from "../services/auth-management/notifier.js";

export const handlePublicOnlyQuery = (publicFields) => {
  return async (context, next) => {
    // this is an "around" hook
    // looks for the "publicInfo" query parameter. If found at all and set to "true", then
    // context.publicDataOnly is set to true else it is set to false.
    // the 'publicInfo' entry is then removed from query to prevent the parameter from being seen elsewhere.
    if (context.params.query.publicInfo === "true") {
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

export const isPublicOnly = async (context) => {
  return (context.publicDataOnly === true)
}

export const isNotPublicOnly = async (context) => {
  return (context.publicDataOnly !== false)
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

export const detectSlugWhenPublic = (slugName) => {
  return async (context) => {
    const getId = context.id.toString();
    if (getId.length === 24) {
      console.log("OID detected, nothing to change");
    } else {
      console.log("CHANGE FOR " + getId);
    }
    return context;
  };
}