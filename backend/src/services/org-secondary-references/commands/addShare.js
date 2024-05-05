import _ from "lodash";
import {CollectionNameMap} from "../bookmark.schema.js";
import {buildUserSummary} from "../../users/users.distrib.js";
import mongodb from "mongodb";
import {CollectionNameMappingWithSummaryBuildMethods, validatePayloadBookmarkObject} from "../helpers.js";
import {buildNavUrl, cleanedCuration} from "../../../curation.schema.js";
import {buildOrganizationSummary} from "../../organizations/organizations.distrib.js";
import {BadRequest} from "@feathersjs/errors";

export const addShare = async context => {
  // adds a share entry to the user passed in with 'toUserId'
  const { data } = context;
  const bookmark = data.bookmark;
  validatePayloadBookmarkObject(bookmark);

  const toUserId = data.toUserId;
  const receivingUser = await context.app.service('users').get(toUserId);
  if (!receivingUser) {
    throw new BadRequest(`unable to locate user ${toUserId}`);
  }
  const receivingOrg = await context.app.service('organizations').get(receivingUser.personalOrganization._id);
  if (!receivingOrg) {
    throw new BadRequest(`unable to locate personal org for user ${toUserId}`);
  }
  const receivingUserRefId = receivingOrg.orgSecondaryReferencesId;

  const orgSecondaryReferences = await context.service.get(receivingUserRefId);
  let sharedWithMe = orgSecondaryReferences.sharedWithMe || [];

  const doc = await context.app.service(CollectionNameMap[bookmark.collectionName]).get(bookmark.collectionId);
  const docSummary = CollectionNameMappingWithSummaryBuildMethods[CollectionNameMap[bookmark.collectionName]](doc);
  const currentOrganizationId = context.params.user.currentOrganizationId;
  let userOrgSummary = context.params.user.organizations.find((org) => _.isEqual(org._id, currentOrganizationId));
  if (userOrgSummary) {
    userOrgSummary = buildOrganizationSummary(userOrgSummary);
  }
  let curation;
  if (bookmark.collectionName === CollectionNameMap.users) {
    curation = receivingOrg.curation;
  } else {
    curation = doc.curation;
  }

  const bookmarkEntry = {
    _id: (new mongodb.ObjectId()).toString(),
    createdAt: Date.now(),
    createdBy: buildUserSummary(context.params.user),
    onBehalfOf: userOrgSummary,
    description: bookmark.description || '',
    collectionName: bookmark.collectionName,
    collectionSummary: docSummary,
    curation: cleanedCuration(curation),
  }
  let needPatch = false;
  if (!sharedWithMe.some(bm => bm.collectionName === bookmarkEntry.collectionName && bm.collectionSummary._id.equals(bookmarkEntry.collectionSummary._id))) {
    sharedWithMe.push(bookmarkEntry);
    needPatch = true;
  }

  if (needPatch) {
    await context.service.patch(
      receivingUserRefId,
      {
        sharedWithMe: sharedWithMe,
      }
    )
    try {
      const baseUrl = context.app.get('frontendUrl');
      const link = buildNavUrl(bookmarkEntry.curation.nav, baseUrl);
      const message = bookmarkEntry.description || '';
      const result = await context.app.service('notifications').patch(
        context.params.user.notificationsId,
        {
          shouldSendUserNotification: true,
          messageDetail: {
            to: toUserId,
            message: 'itemShared',
            nav: bookmarkEntry.curation.nav,
            parameters: {
              link: link,
              name: bookmarkEntry.curation.name,
              message: message,
            },
          },
        },
        {
          authentication: context.params.authentication,
        }
      )
    } catch (e) {
      console.log(`on notification, got error: ${e.error}`);
    }
    context.result = {
      success: true,
      result: `sent share for ${JSON.stringify(curation.nav)} to user ${toUserId}`
    }
  } else {
    // the extra "period" on result is a subtle sign the object was already shared.
    // technically, the sender should not know of the state of the receiver's bookmarks.
    context.result = {
      success: true,
      result: `sent share for ${JSON.stringify(curation.nav)} to user ${toUserId}.`
    }
  }

  context.data = _.omit(data, ['shouldAddShare', 'bookmark', 'toUserId']);
  return context;
};