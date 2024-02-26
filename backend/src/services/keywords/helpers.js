

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
