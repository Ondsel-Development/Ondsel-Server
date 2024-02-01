import _ from 'lodash';
import {matchingCuration} from "../../../curation.schema.js";
import {MAX_MATCHES_KEPT} from "../keywords.subdocs.js";
import {getOrInsertKeyword} from "../helpers.js";


export const removeScore = async context => {
  const params = context.data;
  const curationToRemove = params.curation;

  let keywordObj = await getOrInsertKeyword(context);
  let sortedMatches = keywordObj.sortedMatches || [];
  sortedMatches = sortedMatches.filter(m => !matchingCuration(m.curation, curationToRemove))
  sortedMatches.sort((a, b) => b.score - a.score) // shouldn't be needed, but good to be safe
  sortedMatches = sortedMatches.slice(0, MAX_MATCHES_KEPT); // shouldn't be needed, but good to be safe
  context.data.sortedMatches = sortedMatches; // update to a new type of patch
  context.data = _.omit(context.data, ['shouldRemoveScore', 'curation']);
  return context;
}
