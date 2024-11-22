// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { makeAuthPlugin } from '@/plugins/feathers-client'

export default makeAuthPlugin({ userService: 'users' })
