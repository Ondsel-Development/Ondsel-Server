import {getTierConfig} from '../../tier-constraint.js';
import {BadRequest} from '@feathersjs/errors';


const upgradeTierErrorMsg = 'Please upgrade your tier.'

export const canUserCreateModel = async context => {
  const { user } = context.params;
  const modelService = context.app.service('models');
  const models = await modelService.find({
    query: {
      $select: ['_id'],
      isSharedModel: false,
      userId: user._id
    }
  });
  const tierConfig = getTierConfig(user.tier);
  if (models.total >= tierConfig.maxModelObjects) {
    throw new BadRequest(upgradeTierErrorMsg);
  }
  return context;
}


export const canUserUpdateModel = async context => {
  if (!context.params.$triggerObjGeneration && context.id) {
    const tierConfig = getTierConfig(context.params.user.tier);
    const model = await context.service.get(context.id);
    if (model.objUrl && !tierConfig.canUpdateModelParameters) {
      throw new BadRequest(upgradeTierErrorMsg);
    }
  }
  return context;
}

export const canUserExportModel = async context => {
  const tierConfig = getTierConfig(context.params.user.tier);
  if (!tierConfig.canExportModel) {
    throw new BadRequest(upgradeTierErrorMsg);
  }
  return context;
}

export const canUserCreateShareLink = async context => {
  const tierConfig = getTierConfig(context.params.user.tier);

  if (context.data.cloneModelId) {
    const sharedModels = await context.app.service('shared-models').find({
      query: {
        $select: ['_id'],
        cloneModelId: context.data.cloneModelId,
        isSystemGenerated: false
      }
    })
    if (sharedModels.total >= tierConfig.maxShareLinksPerModel) {
      throw new BadRequest(upgradeTierErrorMsg);
    }
  }

  return context;
}
