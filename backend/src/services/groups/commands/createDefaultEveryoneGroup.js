import {buildUserSummary} from "../../users/users.distrib.js";

export const createDefaultEveryoneGroup = async (context) => {
  const orgId = context.data._id;
  const thisGroup = context.data.groups[0];
  const firstUser = buildUserSummary(context.params.user);

  if (orgId !== undefined) {
    const groupService = context.app.service('groups');
    const newGroup = await groupService.create({
      _id: thisGroup._id,
      name: thisGroup.name,
      organizationId: orgId,
      users: [firstUser],
    }, {
      authentication: context.params.authentication,
    });
  }
  return context;
}
