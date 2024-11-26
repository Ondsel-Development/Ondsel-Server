// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from "lodash";
import {validatePayloadBookmarkObject} from "../helpers.js";


export const removeBookmark = async context => {
  const { data } = context;
  const bookmark = data.bookmark;

  validatePayloadBookmarkObject(bookmark);

  const orgSecondaryReferences = await context.service.get(context.id);
  let { bookmarks } = orgSecondaryReferences;

  bookmarks = bookmarks.filter(bm => !(bm.collectionSummary._id.toString() === bookmark.collectionId && bm.collectionName === bookmark.collectionName));

  context.data.bookmarks = bookmarks;
  context.data = _.omit(data, ['shouldRemoveBookmark', 'bookmark']);
  return context;
}
