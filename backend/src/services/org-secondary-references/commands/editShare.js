import _ from "lodash";
import {validatePayloadBookmarkObject} from "../helpers.js";
import {BadRequest} from "@feathersjs/errors";

export const editShare = async context => {
  // adds a share entry to the user passed in with 'toUserId'
  const { data } = context;
  const bookmark = data.bookmark;
  validatePayloadBookmarkObject(bookmark);

  const orgSecondaryReferences = await context.service.get(context.id);
  let { sharedWithMe } = orgSecondaryReferences;
  const index = sharedWithMe.findIndex(sh => (sh.collectionSummary._id.toString() === bookmark.collectionId && sh.collectionName === bookmark.collectionName));
  if (index < 0) {
    throw new BadRequest("Share does not exist");
  }
  let changeSeen = true;
  if (bookmark.description !== undefined) {
    changeSeen = true;
    sharedWithMe[index].description = bookmark.description;
  }
  if (bookmark.read !== undefined) {
    changeSeen = true;
    sharedWithMe[index].read = bookmark.read;
  }
  if (!changeSeen) {
    throw new BadRequest("Unable to edit Share: no changes sent");
  }

  context.data = _.omit(data, ['shouldEditShare', 'bookmark']);
  context.data.sharedWithMe = sharedWithMe;
  return context;
};