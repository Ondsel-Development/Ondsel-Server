import {buildUserSummary} from "../../users/users.distrib.js";

export const createDefaultEveryoneGroup = async (context) => {
  // this should only be called once after Org CREATE
  const orgId = context.data._id;
  const firstUser = buildUserSummary(context.params.user);

  if (orgId !== undefined) {
    const groupService = context.app.service('groups');
    await groupService.create({
      name: 'Everybody',
      organizationId: orgId,
      takeAllNewUsers: true,
      users: [firstUser],
    }, {
      user: context.params.user,
    });
    context.result = await context.service.get(context.result._id);
  }
  return context;
}
