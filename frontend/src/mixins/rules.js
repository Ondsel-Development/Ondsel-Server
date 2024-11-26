// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export default {
  data: () => ({
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
  })
}
