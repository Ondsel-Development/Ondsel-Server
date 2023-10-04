import _ from "lodash";

export const removeAdminsFromOrganization = async (context) => {
  const { data } = context;

  const organization = await context.service.get(context.id);
  let admins = organization.admins || [];
  for (let userId of data.userIds) {
    admins = admins.filter(user => user._id.toString() !== userId);
  }
  data.admins = admins;
  context.data = _.omit(data, ['shouldRemoveAdminsFromOrganization', 'userIds']);
}
