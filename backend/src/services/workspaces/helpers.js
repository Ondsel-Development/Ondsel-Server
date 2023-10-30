import _ from 'lodash';


export const isUserBelongsToWorkspace = async context => {
  if (context.params.user) {
    const userOrganizations = context.params.user.organizations || []
    context.params.query.organizationId = {
      $in: userOrganizations.map(org => org._id)
    }
  }
  return context;
}

export const createAndAssignRootDirectory = async context => {
  const directory = await context.app.service('directories').create(
    {
      name: '/',
      workspace: {
        _id: context.result._id,
        name: context.result.name,
      }
    }, { user: context.params.user }
  );
  context.result = await context.service.patch(
    context.result._id,
    { rootDirectory: _.pick(directory, ['_id', 'name'])},
  )
  return context;
}
