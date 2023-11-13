import {buildUserSummary} from "../../users/users.distrib.js";

export const createDefaultEveryoneGroup = async (context) => {
  // this should only be called once after Org CREATE
  const orgId = context.data._id;
  const thisGroup = context.data.groups[0];
  const firstUser = buildUserSummary(context.params.user);

  if (orgId !== undefined) {
    const groupService = context.app.service('groups');
    await groupService.create({
      _id: thisGroup._id,
      name: thisGroup.name,
      organizationId: orgId,
      takeAllNewUsers: true,
      users: [firstUser],
    }, {
      user: context.params.user,
    });
  }
  return context;
}
