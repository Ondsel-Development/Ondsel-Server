

export async function safelyGetKeyword(context, keyword){
  // returns an "empty" keyword object if not found
  // does NOT use the GET method to avoid throwing exception
  const keywordsService = context.service;
  const db = await keywordsService.options.Model;

  let keywordObj = {
    _id: keyword,
    sortedMatches: [],
  };
  let keywordFindResult;
  try {
    keywordFindResult = await db.findOne(
      {"_id" : keyword}
    );
  } catch (e) {
    console.log("FINDONE KEYWORD ERR " + e.message);
  }
  if (keywordFindResult) {
    keywordObj = keywordFindResult
  }
  return keywordObj;
}

export async function partialSearch(context, keyword, reduction){
  // returns a list of matches (not sorted)
  // the keyword supplied MUST be a single word; not a phrase
  // reduction is a value between 0.0 and 0.1
  const keywordsService = context.service;
  const kwDb = await keywordsService.options.Model;

  const regex = new RegExp(`^${keyword}.+`, ''); // the '.+' is for avoiding exact matches
  const query = { _id: { $regex: regex } };
  let results=[];
  try {
    const documents = await kwDb.find(query).toArray();
    for (const doc of documents) {
      results.push(...doc.sortedMatches);
    }
  } catch (e) {
    console.log("FIND PARTIAL KEYWORD ERR " + e.message);
  }
  // reduce em all
  for (let match of results) {
    match.score = match.score * reduction;
  }
  return results;
}
