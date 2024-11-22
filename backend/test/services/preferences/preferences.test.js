// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app.js'

describe('preferences service', () => {
  it('registered the service', () => {
    const service = app.service('preferences')

    assert.ok(service, 'Registered the service')
  })
})
