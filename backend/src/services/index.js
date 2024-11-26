// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { keywords } from './keywords/keywords.js'

import { orgInvites } from './org-invites/org-invites.js'

import { directory } from './directories/directories.js'

import { group } from './groups/groups.js'

import { workspace } from './workspaces/workspaces.js'

import { organization } from './organizations/organizations.js'

import { authManagement } from './auth-management/auth-management.js'

import { email } from './email/email.js'

import { runnerLogs } from './runner-logs/runner-logs.js'

import { accountEvent } from './account-event/account-event.js'

import { acceptAgreement } from './agreements/accept/accept.js'

import { agreements } from './agreements/agreements.js'

import { file } from './file/file.js'

import { sharedModels } from './shared-models/shared-models.js'

import { model } from './models/models.js'

import { upload } from './upload/upload.js'

import { user } from './users/users.js'

import { preferences } from './preferences/preferences.js'

import { orgSecondaryReferences } from './org-secondary-references/org-secondary-references.js'

import { notifications } from './notifications/notifications.js'

import { userEngagements } from './user-engagements/user-engagements.js'

import { download } from './download/download.js'

import { publisher } from './publisher/publisher.js'

export const services = (app) => {
  app.configure(orgSecondaryReferences)

  app.configure(preferences)

  app.configure(keywords)

  app.configure(orgInvites)

  app.configure(directory)

  app.configure(group)

  app.configure(workspace)

  app.configure(organization)

  app.configure(authManagement)

  app.configure(email)

  app.configure(runnerLogs)

  app.configure(accountEvent)

  app.configure(acceptAgreement)

  app.configure(agreements)

  app.configure(file)

  app.configure(sharedModels)

  app.configure(model)

  app.configure(upload)

  app.configure(user)

  app.configure(notifications)

  app.configure(userEngagements)

  app.configure(download)

  app.configure(publisher)

  // All services will be registered here
}
