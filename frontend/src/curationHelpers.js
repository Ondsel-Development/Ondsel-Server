export function removeNonPublicItems(curation) {
  // Remove unneeded items from curation that is being shared.
  //
  // This function is being made common so that this removal is consistent and modifiable in one place.
  curation.promoted = [];
  curation.keywordRefs = [];
}
