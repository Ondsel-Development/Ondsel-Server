import {crc32} from "../../../refNameFunctions.js";
import {
  NotificationCadenceTypeMap,
  subscriptionConstraintMap,
  SubscriptionStateMap,
  SubscriptionTypeMap
} from "../users.subdocs.schema.js";
import {organization} from "../../organizations/organizations.js";
import {keywords} from "../../keywords/keywords.js";
import {OrganizationTypeMap} from "../../organizations/organizations.subdocs.schema.js";
import {navTargetMap} from "../../../curation.schema.js";
import {buildUserSummary} from "../users.distrib.js";

export const REDACTED = "<REDACTED>"

export const removeUser = async (context) => {
  //
  // gather data
  //
  const orgService = context.app.service('organizations');
  const wsService = context.app.service('workspaces');
  const dirService = context.app.service('directories');
  const keywordService = context.app.service('keywords');
  const originalUserId = context.id;
  const [trueId, pin] = originalUserId.split("z")
  let user = await context.service.get(trueId);
  let personalOrg = await orgService.get(user.personalOrganization._id);
  const oldOrgCuration = personalOrg.curation;
  const personalOrgId = personalOrg._id;
  const listWorkspaces = await wsService.find({
    paginate: false,
    query: {
      organizationId: personalOrgId
    },
  });
  const defaultWorkspace = listWorkspaces.find(w => w._id.equals(user.defaultWorkspaceId));
  const oldWsCuration = defaultWorkspace?.curation;
  const rootDirId = listWorkspaces[0]?.rootDirectory?._id;
  let rootDir;
  if (rootDirId) {
    try {
      rootDir = await dirService.get(rootDirId);
    } catch {}
  }
  //
  // verify PIN
  //
  const email = user.email;
  const crc = crc32(email).toString();
  if (crc !== pin) {
    context.result = {
      success: false,
      message: 'bad pin',
    }
    console.log(crc);
    return context;
  }
  //
  // identify records that are too complex.
  //   for now, this applies to pretty much anyone with a non-empty account.
  //
  let reasons = [];
  if (user.organizations.length > 1) {
    reasons.push('Belongs to other organizations');
  }
  if (user.tier === SubscriptionTypeMap.peer || user.tier === SubscriptionTypeMap.enterprise) {
    reasons.push('Paid account');
  }
  if (listWorkspaces.total > 1) {
    reasons.push('More than default workspace');
  }
  if (rootDir) {
    if (rootDir.files.length > 0) {
      reasons.push('Default workspace root directory has files');
    }
    if (rootDir.directories.length > 0) {
      reasons.push('Default workspace root directory has subdirectories');
    }
  }
  if (reasons.length > 0) {
    context.result = {
      success: false,
      message: 'too complex; redact by hand. reasons: ' + reasons.join(', '),
    }
    return context;
  }
  //
  // start redaction of actual user record
  //
  let log = [];
  user.email = REDACTED;
  user.name = REDACTED;
  if (user.firstName) {
    delete user.firstName;
  }
  if (user.lastName) {
    delete user.lastName;
  }
  user.password = '';
  user.username = REDACTED;
  user.usernameHash = 0;
  user.tier = SubscriptionTypeMap.deleted;
  user.constraint = subscriptionConstraintMap[SubscriptionTypeMap.deleted];
  user.subscriptionDetail.state = SubscriptionStateMap.closed;
  user.organizations = [
    user.personalOrganization,
  ];
  user.organizations[0].notificationByEmailCadence = NotificationCadenceTypeMap.never;
  if (user.organizations[0].type === undefined) {
    // legacy cleanup
    user.organizations[0].type = OrganizationTypeMap.personal;
  }
  const userDb = await context.app.service('users').options.Model;
  const userResult = await userDb.replaceOne({_id: user._id}, user);
  log.push(`redacted ${userResult.modifiedCount} users`);

  //
  // remove all directories and workspaces
  //
  // dirService.remove(rootDirId) DOES NOT work as it forbids removing root '/'.
  if (rootDir) {
    const dirDb = await dirService.options.Model;
    const dirResult = await dirDb.deleteOne({_id: rootDirId});
    log.push(`deleted ${dirResult.deletedCount} directories`);
  }
  if (defaultWorkspace) {
    const wsDb = await wsService.options.Model;
    const wsResult = await wsDb.deleteOne({_id: defaultWorkspace._id});
    log.push(`deleted ${wsResult.deletedCount} workspaces`);
  }

  //
  // remove/redact all organizations
  //
  const orgDb = await orgService.options.Model;
  const redactedUserSummary = buildUserSummary(user);
  personalOrg.users = [redactedUserSummary];
  personalOrg.users[0].isAdmin = true;
  personalOrg.owner = redactedUserSummary;
  personalOrg.curation.name = REDACTED;
  personalOrg.slug = REDACTED;
  personalOrg.curation.slug = REDACTED;
  personalOrg.curation.description = REDACTED;
  personalOrg.curation.longDescriptionMd = REDACTED;
  personalOrg.curation.tags = [];
  personalOrg.curation.promoted = []
  personalOrg.curation.nav.username = REDACTED;
  personalOrg.curation.keywordRefs = [];
  const orgUpdateResult = await orgDb.replaceOne(
    {_id: personalOrgId},
    personalOrg
  )
  log.push(`redacted ${orgUpdateResult.modifiedCount} personal organizations`);
  const orgResult = await orgService.remove(personalOrg._id);
  if (orgResult) {
    log.push(`org ${personalOrg._id} marked as removed`);
  } else {
    log.push(`org ${personalOrg._id} NOT marked as removed`);
  }

  //
  // remove notifications and secondaryorgrefs
  //
  const ntfDb = await context.app.service('notifications').options.Model;
  const ntfResult = ntfDb.deleteOne({_id: user.notificationsId});
  log.push(`deleted ${ntfResult.deletedCount} notification docs`);
  const orgSecRefDb = await context.app.service('org-secondary-references').options.Model;
  const orgSecRefResult = orgSecRefDb.deleteOne({_id: personalOrg.orgSecondaryReferencesId});
  log.push(`deleted ${orgSecRefResult.deletedCount} org secondary references docs`);

  //
  // bluntly remove keywords to org and workspace
  //
  if (oldWsCuration) {
    for (const kw of oldOrgCuration.keywordRefs) {
      const rmKwWsResult = await keywordService.create({
        shouldRemoveScore: true,
        curation: oldWsCuration,
      });
      log.push(`removed ${rmKwWsResult.sortedMatches.length} workspace keyword ${kw}`);
    }
  }
  for (const kw of oldOrgCuration.keywordRefs) {
    const rmKwOrgResult = await keywordService.create({
      _id: kw,
      shouldRemoveScore: true,
      curation: oldOrgCuration,
    });
    log.push(`removed ${rmKwOrgResult.sortedMatches.length} org keyword ${kw}`);
  }

  context.result = {
    success: true,
    message: 'removal and redaction performed',
    logs: log,
  }
  return context;
}
