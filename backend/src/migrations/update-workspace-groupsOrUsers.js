/*

Due to some coding bug, user subdocs not properly distributed to workspace.groupsOrUsers for newly signed-up user.

Before Migration:
{
  "_id": {
    "$oid": "655f3886e2a5b4e2e90947fc"
  },
  "name": "Default",
  "description": "Your workspace",
  "organizationId": {
    "$oid": "655f3886e2a5b4e2e90947fa"
  },
  "createdAt": 1700739206176,
  "updatedAt": 1700739206210,
  "groupsOrUsers": [
    {
      "type": "User",
      "permission": "write",
      "groupOrUser": {
        "name": "user"
      }
    }
  ],
  "rootDirectory": {
    "_id": {
      "$oid": "655f3886e2a5b4e2e90947fd"
    },
    "name": "/"
  }
}

After Migration:
{
  "_id": {
    "$oid": "655f3886e2a5b4e2e90947fc"
  },
  "name": "Default",
  "description": "Your workspace",
  "organizationId": {
    "$oid": "655f3886e2a5b4e2e90947fa"
  },
  "createdAt": 1700739206176,
  "updatedAt": 1700739206210,
  "groupsOrUsers": [
    {
      "type": "User",
      "permission": "write",
      "groupOrUser": {
        "_id": {
          "$oid": "65731c26b64122e4831b0bc2"
        },
        "username": "yecano9838",
        "email": "yecano9838@newcupon.com",
        "name": "test "
      }
    }
  ],
  "rootDirectory": {
    "_id": {
      "$oid": "655f3886e2a5b4e2e90947fd"
    },
    "name": "/"
  }
}
*/


import { buildUserSummary } from '../services/users/users.distrib.js';

export async function migrateWorkspaceGroupsOrUsersCommand(app) {
  const workspaceService = app.service('workspaces');
  const organizationService = app.service('organizations');
  const userService = app.service('users');
  const db = await workspaceService.options.Model;

  console.log('>>> Collecting workspaces');
  const workspaces = await workspaceService.find({
    paginate: false,
    pipeline: [{
      $match: {
        groupsOrUsers: {
          $elemMatch: {
            type: 'User',
            'groupOrUser._id': { $exists: false }
          }
        }
      }
      }
    ]
  });
  console.log(`>>> Workspace found: ${workspaces.length}`);
  for (let workspace of workspaces) {
    console.log(`>>> Updating workspace (${workspace._id.toString()})`);
    const org = await organizationService.get(workspace.organizationId);
    const user = await userService.get(org.createdBy);
    const groupsOrUsers = [];
    for (let groupOrUser of workspace.groupsOrUsers) {
      if ( groupOrUser.type === 'User' && !groupOrUser.groupOrUser._id && groupOrUser.groupOrUser.name === 'user') {
        groupsOrUsers.push({
          ...groupOrUser,
          groupOrUser: buildUserSummary(user),
        });
      } else {
        groupsOrUsers.push(groupOrUser);
      }
    }
    await db.updateOne({ _id: workspace._id }, { $set: { groupsOrUsers: groupsOrUsers } });
    console.log(`>>> Successfully updated workspace (${workspace._id.toString()})`);
  }
}

