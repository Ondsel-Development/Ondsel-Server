// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ImporterBrep } from '@/threejs/libs/import/importerbrep';
import { ImporterObj } from '@/threejs/libs/import/importerobj';
import { ImporterFcstd } from '@/threejs/libs/import/importerfcstd';
import { ImporterStep } from '@/threejs/libs/import/importerstep';

export class Importer {
  constructor() {
    this.importers = [
      new ImporterBrep(),
      new ImporterObj(),
      new ImporterFcstd(),
      new ImporterStep(),
    ];
    this.activeImporter = null;
  }

  GetFileNameFromUrl(url) {
    // Extract the path part of the URL
    const path = new URL(url).pathname;

    // Get the last part of the path (the file name)
    return path.split('/').pop();
  }

  LoadFile(fileUrl, callback) {
    const fileName = this.GetFileNameFromUrl(fileUrl);
    const fileExtension = fileName.split('.').pop().toUpperCase();
    for (let importer of this.importers) {
      if (importer.CanImportExtension(fileExtension)) {
        this.activeImporter = importer;
        this.activeImporter.LoadFile(fileUrl, callback)
      }
    }
  }
}
