

export async function safelyGetKeyword(context, keyword){
  // returns an "empty" keyword object if not found
  // does NOT use the GET method to avoid throwing exception
  let keywordObj = {
    _id: keyword,
    sortedMatches: [],
  };
  const keywordFindList = await context.service.find({
    query: {
      _id: keyword,
    }
  });
  if (keywordFindList.total !== 0) {
    keywordObj = keywordFindList.data.find(item => item !== undefined);
  }
  if (keywordFindList.total > 1) {
    // the following should NEVER happen
    console.log(`ADMIN ALERT! a duplicate key found in keywords collection: ${keyword}`);
  }
  return keywordObj;
}
