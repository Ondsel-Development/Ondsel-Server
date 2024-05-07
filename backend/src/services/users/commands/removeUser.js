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
  const oldWsCuration = defaultWorkspace.curation;
  const rootDirId = listWorkspaces[0].rootDirectory._id;
  const rootDir = await dirService.get(rootDirId);
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
  if (rootDir.files.length > 0) {
    reasons.push('Default workspace root directory has files');
  }
  if (rootDir.directories.length > 0) {
    reasons.push('Default workspace root directory has subdirectories');
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
  console.log(JSON.stringify(user));

  // TODO apply with direct patch

  //
  // remove all directories and workspaces
  //
  // dirService.remove(rootDirId) DOES NOT works as it forbids removing root '/'.
  const dirDb = dirService.options.Model;
  const dirResult = await dirDb.deleteOne({_id: rootDirId});
  log.push(`deleted ${dirResult.deletedCount} directories`);
  const wsDb = wsService.options.Model;
  const wsResult = await wsDb.deleteOne({_id: defaultWorkspace._id});
  log.push(`deleted ${wsResult.deletedCount} workspaces`);

  //
  // remove/redact all organizations
  //
  personalOrg.curation.name = REDACTED;
  personalOrg.slug = REDACTED;
  personalOrg.curation.description = REDACTED;
  personalOrg.curation.longDescriptionMd = REDACTED;
  personalOrg.curation.tags = [];
  personalOrg.curation.promoted = []
  personalOrg.curation.nav.username = REDACTED;
  await orgService.update(
    personalOrgId,
    personalOrg
  )
  const orgResult = await orgService.remove(personalOrg._id);
  if (orgResult) {
    log.push(`org ${personalOrg._id} marked as removed`);
  } else {
    log.push(`did mark org ${personalOrg._id} as removed`);
  }

  //
  // TODO: remove notifications and secondaryorgrefs
  //

  //
  // bluntly remove keywords to org and workspace
  //
  await keywordService.update({
    shouldRemoveScore: true,
    curation: oldWsCuration,
  });
  await keywordService.update({
    shouldRemoveScore: true,
    curation: oldOrgCuration,
  });

  context.result = {
    success: true,
    message: 'removal and redaction performed',
  }
  return context;
}
