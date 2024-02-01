import _ from 'lodash';
import {matchingCuration} from "../../../curation.schema.js";
import {MAX_MATCHES_KEPT} from "../keywords.subdocs.js";


export const removeScore = async context => {
  const params = context.data;
  const curationToRemove = params.curation;

  const keywordFindList = await context.service.find({
    query: {
      _id: context.id,
    }
  });
  if (keywordFindList.total === 0) {
    context.result = {'nothing_to_change': true}; // setting a result stops the built-in patch operation
  } else {
    const keywordObj = keywordFindList.data.find(item => item !== undefined);
    let sortedMatches = keywordObj.sortedMatches || [];
    sortedMatches = sortedMatches.filter(m => !matchingCuration(m.curation, curationToRemove))
    sortedMatches.sort((a, b) => b.score - a.score) // shouldn't be needed, but good to be safe
    sortedMatches = sortedMatches.slice(0, MAX_MATCHES_KEPT); // shouldn't be needed, but good to be safe
    context.data.sortedMatches = sortedMatches; // update to a new type of patch
  }
  context.data = _.omit(context.data, ['shouldRemoveScore', 'curation']);
  return context;
}
