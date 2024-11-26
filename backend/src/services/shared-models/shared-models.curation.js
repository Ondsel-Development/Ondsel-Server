// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {generateAndApplyKeywords, navTargetMap} from "../../curation.schema.js";
import {buildNewCurationForOrganization} from "../organizations/organizations.curation.js";
import {buildFileSummary} from "../file/file.distrib.js";
import {ProtectionTypeMap, VersionFollowType, VersionFollowTypeMap} from "./shared-models.subdocs.schema.js";
import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {fileVersionSchema} from "../file/file.schema.js";
import {removePrivateFileSummaryFields} from "../file/helpers.js";

export function buildNewCurationForSharedModel(sm) {
  let curation =   {
    _id: sm._id,
    collection: 'shared-models',
    nav: {
      target: navTargetMap.sharedModels,
      sharelinkid: sm._id.toString(),
    },
    name: sm.title,
    slug: '', // a shared model has no searchable slug
    description: '',
    longDescriptionMd: '',
    tags: [],
    representativeFile: null, // this is handled later
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

export const afterCreateHandleSharedModelCuration = async (context) => {
  // first, set up the curation
  context.result.curation = buildNewCurationForSharedModel(context.result);
  if (context.result.model?.file) {
    let file = context.result.model.file;
    let version;
    let thumbnailUrl;
    if (context.result.versionFollowing === VersionFollowTypeMap.locked) {
      version = file.versions[0];
      thumbnailUrl = context.result.model.thumbnailUrlCache || null;
      if (!thumbnailUrl) {
        thumbnailUrl = file.model?.thumbnailUrlCache || null;  // this is somehow ironic
      }
    } else {
      version = file.versions.find((v) => v._id.equals(file.currentVersionId));
      thumbnailUrl = version.thumbnailUrlCache || null;
    }
    context.result.curation.representativeFile = {
      _id: file._id,
      custFileName: file.custFileName,
      modelId: file.modelId,
      currentVersion: version,
      thumbnailUrlCache: thumbnailUrl,
    }
  }
  if (context.result.protection === ProtectionTypeMap.listed) {
    const newKeywordRefs = await generateAndApplyKeywords(context, context.result.curation);
    context.result.curation.keywordRefs = newKeywordRefs;
  }
  const smService = context.service;
  const smDb = await smService.options.Model;
  await smDb.updateOne(
    { _id: context.result._id },
    {
      $set: {
        curation: context.result.curation
      },
    }
  )
  return context;
}

export async function narrowlyUpdateSharedModelCurationRepresentativeFileUrl(app, sharedModel, newUrl, versionSummary) {
  const smService = app.service('shared-models');
  if (sharedModel.curation?.representativeFile) {
    let curation = sharedModel.curation;
    curation.representativeFile.thumbnailUrlCache = newUrl;
    removePrivateFileSummaryFields(versionSummary);
    curation.representativeFile.versionSummary = versionSummary;
    await smService.patch(
      sharedModel._id,
      {
        curation: curation
      },
    )
  }
}