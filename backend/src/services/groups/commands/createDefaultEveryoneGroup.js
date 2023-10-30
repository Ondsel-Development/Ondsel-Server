import {upsertGroupSummaryToOrganization} from "../../organizations/organizations.distrib.js";
import {buildGroupSummary} from "../groups.distrib.js";
import {buildUserSummary} from "../../users/users.distrib.js";

export const createDefaultEveryoneGroup = async (context) => {
  const orgId = context.data._id;
  const firstUser = buildUserSummary(context.params.user);

  if (orgId !== undefined) {
    const groupService = context.app.service('groups');
    const newGroup = await groupService.create({
      name: "Everyone",
      organizationId: orgId,
      users: [firstUser],
    }, {
      authentication: context.params.authentication,
    });
    const newGroupSummary = buildGroupSummary(newGroup);
    await upsertGroupSummaryToOrganization(context, orgId, newGroupSummary);
  }
  return context;
}
