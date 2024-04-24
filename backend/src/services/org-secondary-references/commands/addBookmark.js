import _ from "lodash";
import {BadRequest} from "@feathersjs/errors";
import {CollectionNameMap} from "../bookmark.schema.js";
import {buildUserSummary} from "../../users/users.distrib.js";
import {buildWorkspaceSummary} from "../../workspaces/workspaces.distrib.js";
import {buildModelSummary} from "../../models/models.distrib.js";
import mongodb from "mongodb";
import {buildSharedModelSummary} from "../../shared-models/shared-models.distrib.js";


export const validatePayloadBookmarkObject = bookmark => {
  if (!bookmark) {
    throw new BadRequest('bookmark object is mandatory in payload');
  }
  if (!bookmark.collectionId) {
    throw new BadRequest('"collectionId" field is mandatory in bookmark object');
  }
  if (!bookmark.collectionName) {
    throw new BadRequest('"collection" field is mandatory in bookmark object');
  }
  if (!Object.values(CollectionNameMap).includes(bookmark.collectionName)) {
    throw new BadRequest('"collection" name is not recognized in bookmark object');
  }
};


const CollectionNameMappingWithSummaryBuildMethods = {
  users: buildUserSummary,
  workspaces: buildWorkspaceSummary,
  models: buildModelSummary,
  'shared-models': buildSharedModelSummary,
}


export const addBookmark = async context => {
  const { data } = context;
  const bookmark = data.bookmark;
  validatePayloadBookmarkObject(bookmark);

  const orgSecondaryReferences = await context.service.get(context.id);
  const { bookmarks } = orgSecondaryReferences;

  const doc = await context.app.service(CollectionNameMap[bookmark.collectionName]).get(bookmark.collectionId);

  console.log(doc);
  const docSummary = CollectionNameMappingWithSummaryBuildMethods[CollectionNameMap[bookmark.collectionName]](doc);
  console.log(docSummary);

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