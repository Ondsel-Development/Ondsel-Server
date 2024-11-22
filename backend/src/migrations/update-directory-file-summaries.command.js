// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from "lodash";
import {buildFileSummary} from "../services/file/file.distrib.js";

export async function updateDirectoryFileSummariesCommand(app) {
  console.log('Updating each directory with compliant fresh summaries');
  const fileService = app.service('file');
  const directoryService = app.service('directories');
  const dirs = await directoryService.find({ paginate: false });
  for (let dir of dirs) {
    console.log(`- examining ${dir._id}: ${dir.name}`);
    let freshFiles = []
    for (let fileSum of dir.files) {
      let file = await fileService.get(fileSum._id);
      let newSum = buildFileSummary(file);
      freshFiles.push(newSum);
      console.log(`  -- gathered file summary for ${fileSum._id} ${fileSum.custFileName} @ ${newSum.currentVersion.message}`)
    }
    await directoryService.patch(
      dir._id,
      {
        files: freshFiles
      }
    );
  }
}
