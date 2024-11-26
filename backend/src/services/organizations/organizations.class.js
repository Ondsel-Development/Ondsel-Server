// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { MongoDBService } from '@feathersjs/mongodb'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class OrganizationService extends MongoDBService {}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('organizations'))
  }
}
