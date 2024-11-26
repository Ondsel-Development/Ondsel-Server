// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from 'lodash';
import {matchingCuration} from "../../../curation.schema.js";
import {safelyGetKeyword} from "../helpers.js";


export const removeScore = async context => {
  const params = context.data;
  const curationToRemove = params.curation;
  const keyword = params._id;
  const keywordsService = context.service;
  const db = await keywordsService.options.Model;

  // take action
  await db.updateOne(
    { _id: keyword },
    {
      $setOnInsert: { _id: keyword },
      $pull: {
        sortedMatches: {
          'curation._id': curationToRemove._id,
        }
      },
    },
    { upsert: true }
  )

  // cleanup context
  let keywordObj = await safelyGetKeyword(context, keyword);
  let sortedMatches = keywordObj.sortedMatches || [];
  sortedMatches = sortedMatches.filter(m => !matchingCuration(m.curation, curationToRemove))
  keywordObj.sortedMatches = sortedMatches
  context.data = _.omit(context.data, ['shouldRemoveScore', 'curation']);
  context.result = keywordObj; // setting result tells the framework that the event has been completed
  return context;
}
