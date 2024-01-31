import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {fileSummary} from "./services/file/file.subdocs.js";
import pkg from 'node-rake-v2';
import _ from "lodash";

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
    promoted: Type.Array(), // an array of curations
    keywordRefs: Type.Array(Type.String()), // used for pre-emptive "cleanup" prior to recalculating keywords
  }
)

export async function generateAndApplyKeywords(context, curation) {
  const keywordService = context.app.service('keywords');
  const keywordScores = determineKeywordsWithScore(curation);
  const {keywordRefs: _, ...cleanCuration} = curation;
  // apply the keywords to the collection
  let keywordPromises = []  // there can easily be 100 of these, so send them all at once.
  for (const item of keywordScores) {
    keywordPromises.push( upsertScoreItem(keywordService, item, cleanCuration) )
  }
  await Promise.all(keywordPromises);
  // remove any keywords that are in the original list but not any longer
  const removedKeywords = curation.keywordRefs.filter(kw => !keywordScores.some(item => item.keyword === kw));
  for (const keyword of removedKeywords) {
    await keywordService.patch(
      keyword,
      {
        shouldRemoveScore: true,
        curation: cleanCuration,
      }
    )
  }
  return keywordScores.map(item => item.keyword);
}

async function upsertScoreItem(keywordService, item, cleanCuration) {
    try {
        keywordService.patch(
            item.keyword,
            {
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
        const wordCount = keyword.split(' ').length - 1;
        score += wordCount * perWordPhraseBonus;
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