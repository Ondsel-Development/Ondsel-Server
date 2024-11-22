// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { generateFilesVersionPayload, validateFileVersionPayload } from '../helpers.js';

export const commitNewVersion = async context => {
  validateFileVersionPayload(context);
  const { versions } = await context.service.get(context.id);

  const newVersion = await generateFilesVersionPayload(context, context.data.version.files);
  versions.push(newVersion);
  context.data = {
    versions: versions,
    currentVersionId: newVersion._id,
  }
  return context;
}