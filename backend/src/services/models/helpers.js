import { BadRequest } from '@feathersjs/errors';


export const canUserAccessModelGetMethod = async context => {

  if (context.params.query.isSharedModel) {
    return context;
  }

  const { file } = await context.service.get(context.id, { query: {$select: ['fileId', 'file']}});

  try {
    await context.app.service('workspaces').get(
      file.workspace._id,
      {
        user: context.params.user
      }
    )
  } catch (error) {
    const workspace = await context.app.service('workspaces').get(
      file.workspace._id, { query: { $select: ['open']} }
    )
    if (workspace.open) {
      context.$isModelBelongsToOpenWorkspace = workspace.open;
      return context;
    }
    throw new BadRequest({ type: 'PermissionError', msg: 'You dont have access to this model'});
  }
  return context;
}


export const userBelongingModels = async context => {
  // Get all user belonging workspaces
  const workspaces = await context.app.service('workspaces').find({
    query: { $select: ['_id'] },
    user: context.params.user,
    paginate: false
  });

  // Collect all files IDs which exists in above workspaces.
  // We need this stage as currently we are not storing file summary to model at DB level.
  const files = await context.app.service('file').find({
    paginate: false,
    pipeline: [
      {
        $match: {
          'workspace._id': {
            $in: workspaces.map(workspace => workspace._id)
          },
        },
      },
      {
        $project: {
          _id: 1,
        },
      }
    ]
  })
  context.params.query.fileId = {
    $in: files.map(f => f._id)
  }
  return context;
}


export const canUserAccessModelPatchMethod = async context => {
  const model = await context.service.get(context.id, { query: {$select: ['userId', 'isSharedModel']}})
  if (model.isSharedModel && model.userId.equals(context.params.user._id)) {
    return context;
  }
  const { file } = await context.service.get(context.id, { query: {$select: ['fileId', 'file']}});

  try {
    const workspace = await context.app.service('workspaces').get(
      file.workspace._id,
      {
        user: context.params.user
      }
    )
    if (workspace.haveWriteAccess) {
      return context;
    }
  } catch (error) {
    throw new BadRequest({ type: 'PermissionError', msg: 'You dont have access to this model'});
  }
  throw new BadRequest({ type: 'PermissionError', msg: 'You dont have write access to this model'});
}