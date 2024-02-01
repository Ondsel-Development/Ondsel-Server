

export async function getOrInsertKeyword(context){
  let keywordObj = null;
  const keywordFindList = await context.service.find({
    query: {
      _id: context.id,
    }
  });
  if (keywordFindList.total === 1) {
    keywordObj = keywordFindList.data.find(item => item !== undefined);
  } else {
    keywordObj = await context.service.create({
      _id: context.id,
      sortedMatches: [],
    });
  }
  return keywordObj;
}