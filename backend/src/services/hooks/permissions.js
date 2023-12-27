import {BadRequest} from '@feathersjs/errors';
import { getConstraint as getUserConstraint } from "../users/users.subdocs.schema.js";


const upgradeTierErrorMsg = 'Please upgrade your tier.'


export const getConstraint = async context => {
  const { file, isSharedModel } = await context.service.get(context.id, { query: { $select: ['fileId', 'file', 'isSharedModel' ] } });
  if (isSharedModel) {
    // Check logged-in user tier if model is a shared-model
    return getUserConstraint(context.params.user);
  }
  // Check organization owner tier
  const { organizationId } = await context.app.service('workspaces').get(file.workspace._id, { query: { $select: ['organizationId'] } });
  const { constraint } = await context.app.service('organizations').get(organizationId, { query: { $select: ['_id', 'owner', 'constraint'] } });
  return constraint;
}


export const canUserCreateModel = async context => {
  const { user } = context.params;
  const fileService = context.app.service('file');
  const workspaceService = context.app.service('workspaces');
  const organizationService = context.app.service('organizations');
  let organizations;
  if (context.data.fileId) {
    // Fetch attached file object
    const file = await fileService.get(context.data.fileId, { query: { $select: ['workspace'] } });
    // Find file belongs to which organization
    const { organizationId } = await workspaceService.get(file.workspace._id, { query: { $select: ['organizationId'] } });
    // Store to context, so that in other hooks we don't call API to fetch Organization
    context.$organization = await organizationService.get(organizationId);
    // Find all the organization as single user can create multiple organizations
    organizations = await organizationService.find({
      paginate: false,
      query: {
        'owner._id': context.$organization.owner._id,
      }
    });
  } else if (context.data.uniqueFileName) {  // File belongs to personal account
    context.$organization = await organizationService.get(user.personalOrganization._id);
    organizations = await organizationService.find({
      paginate: false,
      query: {
        'owner._id': user._id,
      }
    });
  } else {
    throw new BadRequest('Failed to check canUserCreateModel permission');
  }

  // Find all organizations workspaces
  const workspaces = await workspaceService.find({
    paginate: false,
    query: {
      organizationId: {
        $in: organizations.map(o => o._id)
      }
    }
  });
  const files = await fileService.find({
    query: {
      $select: ['_id'],
      'workspace._id': {
        $in: workspaces.map(w => w._id)
      },
      isSystemGenerated: false,
      modelId: { $exists: true },
    }
  });

  if (files.total >= context.$organization.constraint.maxModelObjects) {
    throw new BadRequest(upgradeTierErrorMsg);
  }
  return context;
}


export const canUserUpdateModel = async context => {
  if (!context.params.$triggerObjGeneration && context.id) {
    const tierConfig = await getConstraint(context);
    const model = await context.service.get(context.id);
    if (model.objUrl && !tierConfig.canUpdateModelParameters) {
      throw new BadRequest(upgradeTierErrorMsg);
    }
  }
  return context;
}

export const canUserExportModel = async context => {
  const tierConfig = await getConstraint(context);
  if (!tierConfig.canExportModel) {
    throw new BadRequest(upgradeTierErrorMsg);
  }
  return context;
}

export const canUserCreateShareLink = async context => {

  if (context.data.cloneModelId) {
    const modelService = context.app.service('models');
    const workspaceService = context.app.service('workspaces');
    const organizationService = context.app.service('organizations');

    const { file } = await modelService.get(context.data.cloneModelId, { query: { $select: ['fileId', 'file'] } })
    // Find file belongs to which organization
    const { organizationId } = await workspaceService.get(file.workspace._id, { query: { $select: ['organizationId'] } });
    // Store to context, so that in other hooks we don't call API to fetch Organization
    context.$organization = await organizationService.get(organizationId);

    const sharedModels = await context.app.service('shared-models').find({
      query: {
        $select: ['_id'],
        cloneModelId: context.data.cloneModelId,
        isSystemGenerated: false
      }
    })
    if (sharedModels.total >= context.$organization.constraint.maxShareLinksPerModel) {
      throw new BadRequest(upgradeTierErrorMsg);
    }
  }

  return context;
}
