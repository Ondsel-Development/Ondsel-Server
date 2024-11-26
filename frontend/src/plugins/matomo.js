// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const matomoOptions = {
  host: import.meta.env.VITE_MATOMO_URL,
  siteId: parseInt(import.meta.env.VITE_MATOMO_SITE),
}

// the following maps are used to keep spelling consistent

// trackEvent(category, action, [name], [value])

export const matomoEventCategoryMap = {
  subscription: 'Subscription',
}
export const matomoEventActionMap = {
  upgrade: 'Upgrade',
  downgrade: 'Downgrade',
  cancelChange: 'Cancel Change',
  failure: 'Purchase Failure'
}

export function consistentNameForSubscriptionChange(action, tier) {
  return `${action} to ${tier}`;
}
