// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export async function addEmptyDirectoriesFieldToDirectoryCommand(app) {
  console.log('Adding directory.directories = [] to all directories where .directories not exists.');
  const directoryService = app.service('directories');
  const db = await directoryService.options.Model;
  const updated = await db.updateMany({ directories: { $exists: false } }, { $set: { directories: [] } });
  console.log(updated);
}
