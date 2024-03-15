export function removeNonPublicItems(curation) {
  // Remove unneeded items from curation that is being shared.
  //
  // This function is being made common so that this removal is consistent and modifiable in one place.
  curation.promoted = [];
  curation.keywordRefs = [];
}

export function translateCollection(collection) {
  let tr = '';
  switch (collection) {
    case 'workspaces':
      tr = 'workspace';
      break;
    case 'organizations':
      tr = 'organization';
      break;
    case 'users':
      tr = 'individual user';
      break;
    case 'shared-models':
      tr = 'shared CAD model';
      break;
  }
  return tr;
}
