import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {fileSummary} from "./services/file/file.subdocs.js";
import pkg from 'node-rake-v2';
import _ from "lodash";
import {userSummarySchema} from "./services/users/users.subdocs.schema.js";

// this schema is shared by users, organizations, and workspaces (and possibly others)
// But, this is NOT a collection, so it is placed here as a shared item with a suite
// of support functions.

export const curationSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    collection: Type.String(),
    name: Type.String(), // limited to 40 runes (unicode code points aka characters)
    description: Type.String(), // limited to 80 runes
    longDescriptionMd: Type.String(), // markdown expected
    tags: Type.Array(Type.String()), // list of zero or more lower-case strings
    representativeFile: Type.Union([Type.Null(), fileSummary]), // if applicable
    promoted: Type.Array(Type.Any()), // an array of promotionSchema
    keywordRefs: Type.Array(Type.String()), // used for pre-emptive "cleanup" prior to recalculating keywords
  }
)

export const notationSchema = Type.Object(
  {
    updatedAt: Type.Number(), // date/time when last updated
    historicUser: userSummarySchema, // user who posted the notation/comment; stored for diagnostics; does not need live update ("historic")
    message: Type.String(), // the public comment made about the promotion
  }
)

export const promotionSchema = Type.Object(
  {
    notation: notationSchema, // a 'notational comment' added by the promoter
    curation: curationSchema, // use 'curationSummaryOfCuration` method to shorten
  }
)

const MAX_LONG_DESC_SUM = 60;
export function curationSummaryOfCuration(curation) {
  // a smaller "summary" of fields for embedding
  let curationSum = curation;
  const longDesc = curation.longDescriptionMd;
  curationSum.longDescriptionMd = longDesc.length > MAX_LONG_DESC_SUM ?
    longDesc.substring(0, MAX_LONG_DESC_SUM - 3) + "..." : longDesc;
  curationSum.promoted = [];
  curationSum.keywordRefs = [];
  return curationSum;
}

export function matchingCuration(curationA, curationB) {
  if (curationA?._id.toString() === curationB?._id.toString()) {
    if (curationA?.collection === curationB?.collection) {
      return true;
    }
  }
  return false;
};

export async function generateAndApplyKeywords(context, curation) {
  const keywordService = context.app.service('keywords');
  const keywordScores = determineKeywordsWithScore(curation);
  let {keywordRefs: _, ...cleanCuration} = curation;
  cleanCuration.keywordRefs = [];
  // apply the keywords to the collection
  for (const item of keywordScores) {
    await upsertScoreItem(keywordService, item, cleanCuration);
  }
  // remove any keywords that are in the original list but not now
  const removedKeywords = curation.keywordRefs.filter(kw => !keywordScores.some(item => item.keyword === kw));
  for (const keyword of removedKeywords) {
    await keywordService.create(
      {
        _id: keyword,
        shouldRemoveScore: true,
        curation: cleanCuration,
      }
    )
  }

  return keywordScores.map(item => item.keyword);
}

// TODO: the following is not reliable in volume such as migration tool. Why?
// let keywordPromises = []  // there can easily be 100 of these, so send them all at once.
// for (const item of keywordScores) {
//   keywordPromises.push( upsertScoreItem(keywordService, item, cleanCuration) )
// }
// await Promise.all(keywordPromises);


async function upsertScoreItem(keywordService, item, cleanCuration) {
    try {
        keywordService.create(
            {
                _id: item.keyword,
                shouldUpsertScore: true,
                score: item.score,
                curation: cleanCuration,
            }
        )
    } catch (e) {
        console.log(item.keyword, e.message)
    }
}

// Score constants. To be tweaked as we learn more.

// a word simply appearing in an item gives it a strong score
const nameStart = 150;
const descStart = 125;
const longDescStart = 100;
const tagStart = 125;

// the maximum score. If a bigger number is found, it is clipped to the max.
//    all of these max numbers should add up to 1000.
const nameMax = 300;
const descMax = 250;
const longDescMax = 200;
const tagMax = 250;

// the keywords are in an order. for some strings, being seen "later" has a cost
// the RAKE algo places the "most important keywords" first.
// the first item has nothing deducted, the second is decremented once, the third twice, etc.
const nameOrderCost = 0;  // order does not matter in a name; order is often an effect of grammar
const descOrderCost = -1;
const longDescOrderCost = -2;
const tagOrderCost = 0;  // order does not matter for tags as it is arbitrary

// keyword limit for long desc
const keywordLimitForLongDesc = 60;

// multiword phrases are "more distinct". each additional word adds Score
const perWordPhraseBonus = 30;

export function determineKeywordsWithScore(curation) {
    // returns a dictionary containing "keyphrase"
    // score is an integer from 0 to 1000; it describes the relative "importance" in terms of the content
    let keywordScores = []
    //
    // name
    //
    const nameKeywords = useRake(curation.name);
    accumulateScores(keywordScores, nameKeywords, nameStart, nameMax, nameOrderCost);
    //
    // description
    //
    const descKeywords = useRake(curation.description);
    accumulateScores(keywordScores, descKeywords, descStart, descMax, descOrderCost);
    //
    // longDescriptionMd
    //
    let longDescKeywords = useRake(curation.longDescriptionMd);
    longDescKeywords = longDescKeywords.slice(0, keywordLimitForLongDesc);
    accumulateScores(keywordScores, longDescKeywords, longDescStart, longDescMax, longDescOrderCost);
    //
    // tags
    //
    const lowerTags = curation.tags.map(tag => tag.toLocaleLowerCase());
    accumulateScores(keywordScores, lowerTags, tagStart, tagMax, tagOrderCost);
    //
    // and now put it in order
    //
    keywordScores.sort((a, b) => b.score - a.score);
    return keywordScores;
}

function useRake(str) {
    // use rake to pull out keywords and phrases
    const {NodeRakeV2} = pkg;

    const rake = new NodeRakeV2();
    const cleanStr = str || "";  // rake does not handle undefined or null well.
    let plainStr = cleanStr.replace(/[.,\/#!$%\^&\*;:{}=\-_`'~()\[\]\n]/g," ");
    let tighterStr = plainStr.replace(/\s+/g, ' ');
    const normalizedList = rake.generate(tighterStr, {removeDuplicates: true});
    // for each multiword phrase append the individual words to the end
    let newWords = [];
    for (const phrase of normalizedList) {
        const splitList = phrase.split(' ')
        if (splitList.length > 1) {
            newWords.push(...splitList)
        }
    }
    normalizedList.push(...newWords);
    // make everything lowercase
    const cleanList = normalizedList.filter((val, idx) => normalizedList.indexOf(val) === idx);
    return cleanList;
}

function accumulateScores(keywordScores, keywordList, scoreStart, scoreMax, orderCost) {
    let counter = 0;
    for (const keyword of keywordList) {
        let score = scoreStart;
        score += orderCost * counter;
        const wordCount = keyword.split(' ').length;
        score += (wordCount - 1) * perWordPhraseBonus;
        if (score > scoreMax) {
            score = scoreMax;
        }
        if (score < 0) {
            score = 0;
        }
        const existingIndex = keywordScores.findIndex(entry => entry.keyword === keyword)
        if (existingIndex >= 0) {
            keywordScores[existingIndex].score += score;
        } else {
            keywordScores.push({
                keyword: keyword,
                score: score,
            })
        }
        counter++;
    }
}

export const beforePatchHandleGenericCuration = (buildFunction) => {
  return async (context) => {
    try {
      //
      // setup
      //
      let changeFound = false;
      let needPatch = false; // if true, then ALSO needing changes applied to keywords
      const originalCuration = context.beforePatchCopy.curation || {};
      const patchCuration = context.data.curation || {};
      let newCuration = {...originalCuration, ...patchCuration};
      if (!newCuration._id) {
        // if the original curation _id is missing, then something failed to created it in the past. recreate it first.
        const tempCuration = buildFunction(context.beforePatchCopy);
        newCuration = {...tempCuration, ...patchCuration};
        needPatch = true;
        changeFound = true;
      }
      //
      // name (pulled from parent except for personal orgs)
      //
      if (context.data.name && context.beforePatchCopy.name !== context.data.name) { // indirect patch
        needPatch = true;
        newCuration.name = context.data.name;
      }
      if (patchCuration.name !== undefined && patchCuration.name !== originalCuration.name) { // direct patch
        needPatch = true;
      }
      //
      // description (pulled from parent except when not)
      //
      if (context.data.description && context.beforePatchCopy.description !== context.data.description) { // indirect set
        needPatch = true;
        newCuration.description = context.data.description;
      }
      if (context.data.curation?.description && context.beforePatchCopy.curation?.description !== newCuration.description) { // direct set
        needPatch = true;
        newCuration.description = context.data.curation?.description || '';
      }
      //
      // long description
      //
      if (patchCuration.longDescriptionMd !== undefined && originalCuration.longDescriptionMd !== newCuration.longDescriptionMd) {
        changeFound = true;
      }
      //
      // tags
      //
      if (patchCuration.tags && !_.isEqual(originalCuration.tags, newCuration.tags)) {
        changeFound = true;
      }
      //
      // representative file
      //
      if (newCuration.collection === 'workspaces') {
        if (patchCuration.representativeFile && originalCuration.representativeFile !== newCuration.representativeFile) {
          changeFound = true;
        }
      } else {
        if (newCuration.representativeFile) {
          newCuration.representativeFile = null;
          console.log("MINOR ERROR: a `representativeFile` was set for a non-workspace curation. setting to null.");
        }
      }
      //
      // handle keyword generation
      //
      let isOpenEnoughForKeywords = false;
      switch (newCuration.collection) {
        case 'workspaces':
          isOpenEnoughForKeywords = context.beforePatchCopy.open;
          break;
        case 'organizations':
          isOpenEnoughForKeywords = true; // the purposeful curation of an org/user, even 'Private' ones, are public details of that org
          break;
        case 'users':
          isOpenEnoughForKeywords = true; // the purposeful curation of an org/user, even 'Private' ones, are public details of that org
          break;
        case 'shared-models':
          isOpenEnoughForKeywords = context.beforePatchCopy.canViewModel && !context.beforePatchCopy.isSystemGenerated; // TODO: correct?
          break;
        case 'ondsel':
          isOpenEnoughForKeywords = false; // the curation itself is public; but it is way too meta for keyword search
          break;
      }
      if (needPatch || changeFound) {
        if (isOpenEnoughForKeywords) {
          const newKeywordRefs = await generateAndApplyKeywords(context, newCuration);
          if (!_.isEqual(newKeywordRefs, originalCuration.keywordRefs)) {
            newCuration.keywordRefs = newKeywordRefs;
            needPatch = true;
          }
        }
      }
      //
      // set the new proper patch
      //
      if (needPatch) {
        context.data.curation = newCuration;
      }
    } catch (e) {
      console.log(e);
    }
    return context;
  }
}
