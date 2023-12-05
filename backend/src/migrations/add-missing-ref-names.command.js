import {conformRefName, refNameHasher} from "../refNameFunctions.js";

export async function addMissingRefNamesCommand(app) {
  const organizationService = app.service('organizations');
  const workspaceService = app.service('workspaces');
  //
  console.log('Finding organizations without refName and/or refNameHash');
  const orgs = await organizationService.find({ paginate: false });
  for (let org of orgs) {
    let change = {};
    let refName = org.refName;
    if (refName === undefined || refName.length < 4) {
      if (org.name === 'Personal') {
        refName = org.createdBy.toString()
      } else {
        refName = conformRefName(org.name).padEnd(4, "0")
      }
      change['refName'] = refName
    }
    let properHash = refNameHasher(refName)
    if (org.refNameHash !== properHash) {
      change['refNameHash'] = properHash
    }
    if (Object.keys(change).length === 0) {
      console.log(`- org ${org._id} '${org.name}' is good with refName ${org.refName}`);
    } else {
      console.log(`- org ${org._id} '${org.name}' is bad. Correcting with ${JSON.stringify(change)}`);
      await organizationService.patch(
        org._id,
        change
      )
    }
  }
  //
  console.log('Finding workspaces without refName and refNameHash');
  const workspaces = await workspaceService.find({ paginate: false });
  for (let ws of workspaces) {
    let change = {};
    let refName = ws.refName;
    if (refName === undefined || refName.length < 4) {
      refName = conformRefName(ws.name).padEnd(4, "0")
      change['refName'] = refName
      change['refNameHash'] = refNameHasher(refName)
    }
    if (Object.keys(change).length === 0) {
      console.log(`- workspace ${ws._id} '${ws.name}' is good with refName ${ws.refName}`);
    } else {
      console.log(`- workspace ${ws._id} '${ws.name}' is bad. Correcting with ${JSON.stringify(change)}`);
      await workspaceService.patch(
        ws._id,
        change
      )
    }
  }
}
