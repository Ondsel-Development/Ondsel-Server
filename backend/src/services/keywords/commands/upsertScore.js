import _ from 'lodash';
import {matchingCuration} from "../../../curation.schema.js";
import {MAX_MATCHES_KEPT} from "../keywords.subdocs.js";
import {safelyGetKeyword} from "../helpers.js";


const ACT_DO_NOTHING = 0;
const ACT_APPEND = 1;
const ACT_REPLACE = 2;
const ACT_REMOVE = 3;

export const upsertScore = async context => {
  // this is called by the 'create' method
  const keywordsService = context.service;
  const db = await keywordsService.options.Model;

  // gather data
  const params = context.data;
  const keyword = context.data._id;
  const newScore = params.score;
  const newCuration = params.curation;
  const newItem = {
    score: newScore,
    curation: newCuration,
  }
  let keywordObj = await safelyGetKeyword(context, keyword);
  let originalMatches = keywordObj.sortedMatches || [];
  // remove any legacy duplicates while maintaining order
  let sortedMatches = originalMatches.filter((match, index) => {
    return index === originalMatches.findIndex(m => match.curation._id.toString() === m.curation._id.toString());
  });
  let duplicatesFound = sortedMatches.length !== originalMatches.length;
  if (duplicatesFound) {
    console.log(`note: duplicates found in keyword \"${keyword}\"`);
  } else {
    // be paranoid and point "sortedMatches" to the original
    sortedMatches = originalMatches
  }

  // make decision and modify sortedMatches (even if not replacing)
  let actionToTake = ACT_DO_NOTHING;
  if (sortedMatches.length === 0) {
    actionToTake = ACT_APPEND;
    sortedMatches.push(newItem);
  } else {
    let minScore = Math.min(...sortedMatches.map(item => item.score));
    if (minScore === Infinity) minScore = -1;
    const index = sortedMatches.findIndex(match => matchingCuration(newCuration, match.curation));
    if (index >= 0) { // match found
      if (newScore < minScore && sortedMatches.length >= MAX_MATCHES_KEPT) {
        actionToTake = ACT_REMOVE;
        sortedMatches.splice(index, 1);
      } else {
        actionToTake = ACT_REPLACE;
        sortedMatches[index] = newItem;
      }
    } else {
      if (newScore > minScore || sortedMatches.length < MAX_MATCHES_KEPT) {
        actionToTake = ACT_APPEND
        sortedMatches.push(newItem);
      }
    }
  }

  // take action

  if (duplicatesFound) {
    // if a duplicate was found, replace the entire list
    await db.updateOne(
      { _id: keyword },
      {
        $setOnInsert: { _id: keyword },
        $set: { sortedMatches: sortedMatches },
      },
      { upsert: true }
    )
  } else {
    // otherwise be more careful
    switch(actionToTake) {
      case ACT_DO_NOTHING:
        await db.updateOne(
          { _id: keyword },
          {
            $setOnInsert: { _id: keyword },
          },
          { upsert: true }
        )
        break;
      case ACT_APPEND:
        await db.updateOne(
          { _id: keyword },
          {
            $setOnInsert: { _id: keyword },
            $push: { sortedMatches: newItem },
          },
          { upsert: true }
        )
        break;
      case ACT_REPLACE:
        await db.updateOne(
          { _id: keyword },
          {
            $setOnInsert: { _id: keyword },
            $set: { sortedMatches: sortedMatches }, // there is probably a fancier way with $[]
          },
          { upsert: true }
        )
        break;
      case ACT_REMOVE:
        await db.updateOne(
          { _id: keyword },
          {
            $setOnInsert: { _id: keyword },
            $pull: {
              sortedMatches: {
                'curation._id': newItem.curation._id,
              }
            },
          },
          { upsert: true }
        )
        break;
    }
  }

  // cleanup context
  context.data = _.omit(context.data, ['shouldUpsertScore', 'score', 'curation']);
  keywordObj.sortedMatches = sortedMatches; // also send change back to user
  context.result = keywordObj; // setting result tells the framework that the event has been completed
  return context;
}
