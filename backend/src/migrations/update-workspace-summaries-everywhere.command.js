import {buildWorkspaceSummary} from "../services/workspaces/workspaces.distrib.js";
import {buildUserSummary} from "../services/users/users.distrib.js";

export async function updateWorkspaceSummariesEverywhereCommand(app) {
  // bluntly update directories, files, and groups with new Workspace summary
  // update workspaces to public=false if not set
  const workspaceService = app.service('workspaces');
  const userService = app.service('users');
  const directoryService = app.service('directories');
  const fileService = app.service('file');
  const groupService = app.service('groups');

  console.log('>>> getting all workspaces');
  let wsMap = {};
  let wsMapFull = {};
  const wsList = await workspaceService.find({
    paginate: false,
  });
  for (const ws of wsList) {
    wsMap[ws._id.toString()] = buildWorkspaceSummary(ws);
    wsMapFull[ws._id.toString()] = ws;
    if (ws.public === undefined || ws.public === null) {
      await workspaceService.patch(
        ws._id.toString(),
        {
          public: false,
        }
      );
      wsMap[ws._id.toString()].public = false;
    }
  }
  console.log(`>>> workspaces found: ${wsList.length}`);


  console.log('>>> getting all users');
  let userMapFull = {};
  const userList = await userService.find({
    paginate: false,
  });
  for (const u of userList) {
    userMapFull[u._id.toString()] = u;
  }
  console.log(`>>> users found: ${userList.length}`);


  console.log('>>> getting all directories');
  let dirMap = {}; // used during file scanning for verification
  const dirList = await directoryService.find({
    paginate: false,
  });
  console.log(`>>> directories found: ${dirList.length}`);
  for (const dir of dirList) {
    dirMap[dir._id.toString()] = dir;
    if (wsMap.hasOwnProperty(dir.workspace?._id.toString())) {
      try {
        const wsSummary = wsMap[dir.workspace?._id.toString()];
        await directoryService.patch(
          dir._id.toString(),
          {
            workspace: wsSummary,
          }
        );
        console.log(`  >>> directory ${dir._id.toString()} UPDATED`);
      } catch (e) {
        console.log(`  >>> directory ${dir._id.toString()} ERROR ${e.message}`);
      }
    } else {
      console.log(`  >>> directory ${dir._id.toString()} SKIPPED as workspace ${dir.workspace?._id.toString()} not found`);
    }
  }


  console.log('>>> getting all files');
  const fileList = await fileService.find({
    paginate: false,
    pipeline: [
      { $match: { deleted: { $ne: true } } },
    ],
  });
  console.log(`>>> files found: ${fileList.length}`);
  for (const file of fileList) {
    let wid = file.workspace?._id;
    // if workspaceId missing: look for it (method 1)
    if (wid === undefined || wid === null) {
      const userId = file.userId?.toString();
      if (userMapFull.hasOwnProperty(userId)) {
        wid = userMapFull[userId].defaultWorkspaceId;
        if (wid !== undefined) {
          console.log(`  >>> found missing workspace for file ${file._id.toString()} (try 1) !!!`);
        }
      }
    }
    // if workspaceId missing: look for it (method 2)
    if (wid === undefined) {
      const relatedUsers = file.relatedUserDetails || [];
      const userId = relatedUsers.find(x=> x!==undefined)?._id // get first user instead as potential owner
      if (userMapFull.hasOwnProperty(userId)) {
        const possibleWid = userMapFull[userId].defaultWorkspaceId;
        // examine in reverse to verify that this really is the right user
        if (wsMapFull.hasOwnProperty(possibleWid.toString())) {
          const targetWs = wsMapFull[possibleWid.toString()];
          if (dirMap.hasOwnProperty(targetWs.rootDirectory?._id.toString())) {
            const targetWsRootDirectory = dirMap[targetWs.rootDirectory?._id.toString()];
            const targetWsRootDirectoryFiles = targetWsRootDirectory.files || [];
            if (targetWsRootDirectoryFiles.find((f) => f._id.toString() === file._id.toString())) {
              console.log(`  >>> found missing workspace for file ${file._id.toString()} (try 2)!!!`);
              wid = possibleWid;
            } else {
              console.log(`  >>> first related user for file ${file._id.toString()} has a default workspace with root dir ${targetWs.rootDirectory?._id.toString()} but the file is not there.`)
            }
          } else {
            console.log(`  >>> first related user for file ${file._id.toString()} has a default workspace with root dir ${targetWs.rootDirectory?._id.toString()} which does not appear to exist`)
          }
        } else {
          console.log(`  >>>  Odd file error: ${file._id.toString()} has user that has non-existent default workspace.`)
        }
      }
    }
    if (wsMap.hasOwnProperty(wid?.toString())) {
      try {
        const wsSummary = wsMap[wid?.toString()];
        await fileService.patch(
          file._id.toString(),
          {
            workspace: wsSummary,
          }
        );
        console.log(`  >>> file ${file._id.toString()} UPDATED`);
      } catch (e) {
        console.log(`  >>> file ${file._id.toString()} ERROR ${e.message}`);
      }
    } else {
      console.log(`  >>> file ${file._id.toString()} SKIPPED as workspace ${wid?.toString()} not found`);
    }
  }

  console.log('>>> getting all groups');
  const groupList = await groupService.find({
    paginate: false,
  });
  console.log(`>>> groups found: ${groupList.length}`);
  for (const group of groupList) {
    const groupWorkspaces = group.workspaces || [];
    let allFound = true;
    let groupWorkspaceList = [];
    for (const gw of groupWorkspaces) {
      if (wsMap.hasOwnProperty(gw._id.toString())) {
        groupWorkspaceList.push(wsMap[gw._id.toString()])
      } else {
        allFound = false;
        console.log(`  >>> group ${group._id.toString()} SKIPPED as workspace ${gw.workspace?._id.toString()} not found`);
      }
    }
    if (allFound) {
      try {
        await groupService.patch(
          group._id.toString(),
          {
            workspaces: groupWorkspaceList,
          }
        );
        console.log(`  >>> group ${group._id.toString()} UPDATED`);
      } catch (e) {
        console.log(`  >>> group ${group._id.toString()} ERROR ${e.message}`);
      }
      console.log(`  >>> group ${group._id.toString()} UPDATED`);
    }
  }

  console.log(`>>> command complete.`);
}