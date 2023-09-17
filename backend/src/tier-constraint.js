import _ from 'lodash';


export const tierConfig = {
    Solo: {
        maxModelObjects: 50,
        maxShareLinksPerModel: 2,
        canUpdateModelParameters: false,
        canExportModel: false,
        defaultValueOfPublicLinkGeneration: true,
        canDisableAutomaticGenerationOfPublicLink: false,
    },
    Peer: {
        maxModelObjects: 250,
        maxShareLinksPerModel: 10,
        canUpdateModelParameters: true,
        canExportModel: true,
        defaultValueOfPublicLinkGeneration: false,
        canDisableAutomaticGenerationOfPublicLink: true,
    },
    Enterprise: {
        maxModelObjects: 1000,
        maxShareLinksPerModel: 100,
        canUpdateModelParameters: true,
        canExportModel: true,
        defaultValueOfPublicLinkGeneration: false,
        canDisableAutomaticGenerationOfPublicLink: true,
    },
};

export function getTierConfig(tier){
    return _.get(tierConfig, tier);
}
