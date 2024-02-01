import _ from 'lodash';
import {matchingCuration} from "../../../curation.schema.js";
import {MAX_MATCHES_KEPT} from "../keywords.subdocs.js";
import {getOrInsertKeyword} from "../helpers.js";


export const upsertScore = async context => {
  const params = context.data;
  const newScore = params.score;
  const newCuration = params.curation;

  const keywordObj = await getOrInsertKeyword(context);

  let sortedMatches = keywordObj.sortedMatches || [];
  let minScore = Math.min(...sortedMatches.map(item => item.score));
  if (minScore === Infinity) {
    minScore = -1;
  }

  let makeChange = false;
  const index = sortedMatches.findIndex(match => matchingCuration(newCuration, match.curation));
  if (index >= 0) { // match found
    makeChange = true;
    if (newScore < minScore && sortedMatches.length >= MAX_MATCHES_KEPT) {
      sortedMatches.splice(index, 1);
    } else {
      sortedMatches[index] = {
        score: newScore,
        curation: newCuration,
      }
    }
  } else {
    if (newScore > minScore || sortedMatches.length < MAX_MATCHES_KEPT) {
      makeChange = true;
      sortedMatches.push({
        score: newScore,
        curation: newCuration,
      })
    }
    // else leave alone as the newScore is not high enough
  }

  if (makeChange) {
    sortedMatches.sort((a, b) => b.score - a.score)
    sortedMatches = sortedMatches.slice(0, MAX_MATCHES_KEPT);
    context.data.sortedMatches = sortedMatches; // update to a new type of patch
  } else {
    context.result = {'nothing_to_change': true}; // setting a result stops the built-in patch operation
  }
  context.data = _.omit(context.data, ['shouldUpsertScore', 'score', 'curation']);
  return context;
}
