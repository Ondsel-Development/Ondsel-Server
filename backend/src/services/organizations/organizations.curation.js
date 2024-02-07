
export function buildNewCurationForOrganization(org) {
  let curation =   {
    _id: org._id,
    collection: 'organizations',
    name: org.name || '',
    description: '',
    longDescriptionMd: '',
    tags: [],
    representativeFile: null,
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

