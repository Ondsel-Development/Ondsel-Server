import _ from "lodash";
import {CollectionNameMap} from "../bookmark.schema.js";
import {buildUserSummary} from "../../users/users.distrib.js";
import mongodb from "mongodb";
import {CollectionNameMappingWithSummaryBuildMethods, validatePayloadBookmarkObject} from "../helpers.js";


export const addBookmark = async context => {
  const { data } = context;
  const bookmark = data.bookmark;
  validatePayloadBookmarkObject(bookmark);

  const orgSecondaryReferences = await context.service.get(context.id);
  const { bookmarks } = orgSecondaryReferences;

  const doc = await context.app.service(CollectionNameMap[bookmark.collectionName]).get(bookmark.collectionId);

  const docSummary = CollectionNameMappingWithSummaryBuildMethods[CollectionNameMap[bookmark.collectionName]](doc);

  const bookmarkEntry = {
    _id: (new mongodb.ObjectId()).toString(),
    createdAt: Date.now(),
    createdBy: buildUserSummary(context.params.user),
    description: bookmark.description || '',
    collectionName: bookmark.collectionName,
    collectionSummary: docSummary,
  }

  if (!bookmarks.some(bm => bm.collectionName === bookmarkEntry.collectionName && bm.collectionSummary._id.equals(bookmarkEntry.collectionSummary._id))) {
    bookmarks.push(bookmarkEntry);
  }
  context.data.bookmarks = bookmarks;
  context.data = _.omit(data, ['shouldAddBookmark', 'bookmark']);
  return context;
};
