// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from "lodash";
import {validatePayloadBookmarkObject} from "../helpers.js";

export const removeShare = async context => {
  // removes your OWN share entry
  const { data } = context;
  const bookmark = data.bookmark;

  validatePayloadBookmarkObject(bookmark);

  const orgSecondaryReferences = await context.service.get(context.id);
  let { sharedWithMe } = orgSecondaryReferences;

  sharedWithMe = sharedWithMe.filter(bm => !(bm.collectionSummary._id.toString() === bookmark.collectionId && bm.collectionName === bookmark.collectionName));

  context.data.sharedWithMe = sharedWithMe;
  context.data = _.omit(data, ['shouldRemoveShare', 'bookmark']);
  return context;
}
