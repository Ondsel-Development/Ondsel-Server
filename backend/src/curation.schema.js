import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";
import {fileSummary} from "./services/file/file.subdocs.js";
import pkg from 'node-rake-v2';
import _ from "lodash";
import {userSummarySchema} from "./services/users/users.subdocs.schema.js";
import {buildFileSummary} from "./services/file/file.distrib.js";
import {userPath} from "./services/users/users.shared.js";
import {organizationPath} from "./services/organizations/organizations.shared.js";
import {workspacePath} from "./services/workspaces/workspaces.shared.js";
import {sharedModelsPath} from "./services/shared-models/shared-models.shared.js";
import {OrganizationTypeMap} from "./services/organizations/organizations.subdocs.schema.js";
import {modelPath} from "./services/models/models.shared.js";
import {BadRequest} from "@feathersjs/errors";
import err from "mocha/lib/pending.js";
import {getProperty} from "./helpers.js";
import {ProtectionTypeMap, VersionFollowTypeMap} from './services/shared-models/shared-models.subdocs.schema.js';
import {findThumbnailIfThereIsOne} from "./services/shared-models/helpers.js";

// these schemas are shared by users, organizations, and workspaces (and possibly others)
// But, this is NOT a collection, so it is placed here as a shared item with a suite
// of support functions.

export const navTargetMap = {
  users: userPath,
  organizations: organizationPath,
  workspaces: workspacePath,
  sharedModels: sharedModelsPath,
  models: modelPath,
  ondsel: 'ondsel', // meta ref for lens home page, not a collection name
}

export const navTargetType = StringEnum([
  navTargetMap.users,
  navTargetMap.organizations,
  navTargetMap.workspaces,
  navTargetMap.sharedModels,
  navTargetMap.models,
  navTargetMap.ondsel,
])

// TODO: add curation and model support to Models in addition to SharedModels
export const navRefSchema = Type.Object(
  // from frontend:
  // - users: /user/:slug                         -> slug renamed username
  // - organizations: /org/:slug                  -> slug renamed orgname
  // - workspaces: /user/:slug/workspace/:wsname  -> slug renamed username
  // - workspaces: /org/:slug/workspace/:wsname   -> slug renamed orgname
  // - shared-models: /share/:id                  -> id renamed sharelinkid
  // - models: /model/:id                         -> id renamed to modelId
  {
    target: navTargetType,
    username: Type.Optional(Type.String()),
    orgname: Type.Optional(Type.String()),
    wsname: Type.Optional(Type.String()),
    sharelinkid: Type.Optional(Type.String()),
    modelId: Type.Optional(Type.String()),
  }
)

// - users: /user/:slug                         -> slug renamed username
// - organizations: /org/:slug                  -> slug renamed orgname
// - workspaces: /user/:slug/workspace/:wsname  -> slug renamed username
// - workspaces: /org/:slug/workspace/:wsname   -> slug renamed orgname
// - shared-models: /share/:id                  -> id renamed sharelinkid
// - models: /model/:id                         -> id renamed to modelid
export function buildNavUrl(nav, baseUrl) {
  let url = "/404";
  switch (nav.target) {
    case navTargetMap.users:
      url = `/user/${nav.username}`;
      break;
    case navTargetMap.organizations:
      url = `/org/${nav.orgname}`;
      break;
    case navTargetMap.workspaces:
      if (nav.orgname) {
        url = `/org/${nav.orgname}/workspace/${nav.wsname}`;
      } else {
        url = `/user/${nav.username}/workspace/${nav.wsname}`;
      }
      break;
    case navTargetMap.sharedModels:
      url = `/share/${nav.sharelinkid}`;
      break;
    case navTargetMap.models:
      url = `/model/${nav.modelid}`;
      break;
    case navTargetMap.ondsel:
      url = "/";
      break;
  }
  const finalUrl = baseUrl + url;
  return finalUrl;
}

export const validateNavObject = (navField, isRequired) => {
  return async (context) => {
    // uses context.data for validation
    // use dotted notation for the fieldName, so "nav" or "something.curation.nav"
    const navValue = getProperty(navField, context.data)
    let errMsgs = [];
    if (navValue === undefined && !isRequired) { // only 'undefined' will make Type.Optional() happy; null does not
      return context;
    }
    if (!navValue) {
      errMsgs.push(`nav value ${navValue} missing, null, or empty`);
    } else {
      switch (navValue.target) {
        case navTargetMap.users:
          if (!navValue.username) {
            errMsgs.push("for a user the username must be supplied");
          }
          break;
        case navTargetMap.organizations:
          if (!navValue.orgname) {
            errMsgs.push("for an organization the orgname must be supplied");
          }
          break;
        case navTargetMap.workspaces:
          if (!navValue.wsname) {
            errMsgs.push("for a workspace the wsname must be supplied");
          }
          if ((!navValue.username) && (!navValue.orgname)) {
            errMsgs.push("for a workspace the username OR orgname must be supplied");
          }
          break;
        case navTargetMap.sharedModels:
          if (!navValue.sharelinkid) {
            errMsgs.push("for a shared-model the sharelinkid must be supplied");
          }
          break;
        default:
          errMsgs.push(`target "${navValue.target}" is not a legit value`);
          break;
      }
    }
    if (errMsgs.length > 0) {
      const finalErrorMessage = 'problems with nav object found: ' + errMsgs.join(', ');
      throw new BadRequest(finalErrorMessage);
    }
    return context;
  }
}

// TODO: some day, remove 'promoted' from curationSchema. A promotions list belongs outside of the curation
//       object; perhaps in the parent object or elsewhere.

export const curationSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    collection: Type.String(),
    nav: navRefSchema,
    name: Type.String(), // limited to 40 runes (unicode code points aka characters)
    slug: Type.String(), // this "slug" is for searching, not navigation/urls/api. For navigation, use `nav` field.
    description: Type.String(), // limited to 80 runes
    longDescriptionMd: Type.String(), // markdown expected
    tags: Type.Array(Type.String()), // list of zero or more lower-case strings
    representativeFile: Type.Optional(Type.Union([Type.Null(), fileSummary])), // if applicable
    promoted: Type.Optional(Type.Array(Type.Any())), // an array of promotionSchema
    keywordRefs: Type.Optional(Type.Array(Type.String())), // used for pre-emptive "cleanup" prior to recalculating keywords
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

export function cleanedCuration(curation) {
  // returns a curation without self-references such as keywordRefs and 'promoted'
  let {...cleanCuration} = curation;
  delete cleanCuration.keywordRefs;
  delete cleanCuration.promoted;
  return cleanCuration;
}

export async function generateAndApplyKeywords(context, curation) {
  const keywordService = context.app.service('keywords');
  const keywordScores = determineKeywordsWithScore(curation);
  let cleanCuration = cleanedCuration(curation);
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
const slugStart = 175;
const nameStart = 150;
const descStart = 125;
const longDescStart = 100;
const tagStart = 125;

// the maximum score. If a bigger number is found, it is clipped to the max.
//    all of these max numbers should add up to 1000.
const slugMax = 300;
const nameMax = 300;
const descMax = 250;
const longDescMax = 200;
const tagMax = 250;

// the keywords are in an order. for some strings, being seen "later" has a cost
// the RAKE algo places the "most important keywords" first.
// the first item has nothing deducted, the second is decremented once, the third twice, etc.
const slugOrderCost = 0;  // order does not matter
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
    // slug
    //
    let slugKeywords = useRake(curation.slug);
    switch (curation.collection) {
      case navTargetMap.workspaces:
        slugKeywords = _.without(slugKeywords, 'default')
        break;
    }
    accumulateScores(keywordScores, slugKeywords, slugStart, slugMax, slugOrderCost);
    //
    // name
    //
    let nameKeywords = useRake(curation.name);
    switch (curation.collection) {
      case navTargetMap.organizations:
        nameKeywords = _.without(nameKeywords, 'personal');
        break;
      case navTargetMap.workspaces:
        nameKeywords = _.without(nameKeywords, 'workspace')
        nameKeywords = _.without(nameKeywords, 'default')
        break;
      case navTargetMap.sharedModels:
        nameKeywords = _.without(nameKeywords, 'fcstd')
        break;
    }
    accumulateScores(keywordScores, nameKeywords, nameStart, nameMax, nameOrderCost);
    //
    // description
    //
    let descKeywords = useRake(curation.description);
    switch (curation.collection) {
      case navTargetMap.workspaces:
        descKeywords = _.without(descKeywords, 'workspace')
        descKeywords = _.without(descKeywords, 'default')
        break;
      case navTargetMap.sharedModels:
        descKeywords = _.without(descKeywords, 'system')
        descKeywords = _.without(descKeywords, 'generated')
        descKeywords = _.without(descKeywords, 'system generated')
        break;
    }
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

export function useRake(str) {
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
      if (context.data.curation?.resetKeywords) {
        delete context.data.curation.resetKeywords;
        changeFound = true;
      }
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
      // slug: skipping since a slug can't change once created.
      //
      //
      // nav: this also can't be modified after creation, but, for migration purposes, I'll check anyway.
      //  TODO: remove the whole nav check after nav migration PR has happened.
      //
      if (!_.isEqual(originalCuration.nav, newCuration.nav)) {
        needPatch = true;
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
      if (newCuration.collection === 'shared-models') {
        if (!newCuration.name) {
          if (newCuration.representativeFile?.custFileName) {
            newCuration.name = newCuration.representativeFile.custFileName;
            needPatch = true;
          }
        }
      }
      //
      // description (pulled from parent, usually)
      //
      if (newCuration.collection === navTargetMap.sharedModels) {
        if (context.data.title) { // if changing the title
          if (context.data.title !== originalCuration.description) {
            needPatch = true;
            newCuration.description = context.data.title;
          }
        }
      } else {
        if (context.data.curation?.description && context.beforePatchCopy.curation?.description !== newCuration.description) { // direct set
          needPatch = true;
          newCuration.description = context.data.curation?.description || '';
        }
        if (context.data.description && context.beforePatchCopy.description !== context.data.description) { // indirect set
          needPatch = true;
          newCuration.description = context.data.description;
        }
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
      if (!_.isEqual(originalCuration.tags, newCuration.tags)) {
        changeFound = true;
      }
      //
      // representative file
      //
      switch (newCuration.collection) {
        case navTargetMap.workspaces:
          if (patchCuration.representativeFile && originalCuration.representativeFile !== newCuration.representativeFile) {
            changeFound = true;
          }
          break;
        case navTargetMap.sharedModels:
          if (!newCuration.representativeFile) {
            if (context.beforePatchCopy.model?.file?.custFileName) {
              newCuration.representativeFile = buildFileSummary(context.beforePatchCopy.model.file);
              needPatch = true;
            }
          }
          if (newCuration.representativeFile && newCuration.representativeFile.thumbnailUrlCache === null) {
            newCuration.representativeFile.thumbnailUrlCache = await findThumbnailIfThereIsOne(context, context.beforePatchCopy);
            if (newCuration.representativeFile.thumbnailUrlCache !== null) {
              needPatch = true;
            }
          }
          break;
        default:
          if (newCuration.representativeFile) {
            newCuration.representativeFile = null;
            console.log("MINOR ERROR: a `representativeFile` was set for a non-workspace curation. setting to null.");
          }
          break;
      }
      //
      // handle keyword generation
      //
      let isOpenEnoughForKeywords = false;
      switch (newCuration.collection) {
        case navTargetMap.workspaces:
          isOpenEnoughForKeywords = context.beforePatchCopy.open;
          break;
        case navTargetMap.organizations:
          isOpenEnoughForKeywords = true; // the purposeful curation of an org/user, even 'Private' ones, are public details of that org
          break;
        case navTargetMap.users:
          isOpenEnoughForKeywords = true; // the purposeful curation of an org/user, even 'Private' ones, are public details of that org
          break;
        case navTargetMap.sharedModels:
          isOpenEnoughForKeywords = context.beforePatchCopy.protection === ProtectionTypeMap.listed;
          break;
        case navTargetMap.ondsel:
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

export const removeCurationFromSearch = async (context) => {
  // to be called 'after' the 'remove'
  const keywordService = context.app.service('keywords');
  const curation = context.result.curation;
  const keywordsList = curation.keywordRefs || [];
  for (const keyword of keywordsList) {
    await keywordService.create(
      {
        _id: keyword,
        shouldRemoveScore: true,
        curation: curation,
      }
    )
  }
}