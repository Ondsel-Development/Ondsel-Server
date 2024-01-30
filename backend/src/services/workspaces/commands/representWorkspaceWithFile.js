import {buildNewCurationForWorkspace} from "../workspaces.curation.js";
import _ from "lodash";
import {buildFileSummary} from "../../file/file.distrib.js";

export const representWorkspaceWithFile = async context => {
  const { data } = context;

  const workspace = await context.service.get(context.id);
  context.data.curation = workspace.curation;
  let fileId = context.data.representativeFileId || null;
  if (fileId === "") {
    fileId = null;
  }
  if (fileId === null) {
    context.data.curation.representativeFile = null;
  } else {
    const file = await context.app.service('file').get(fileId);
    context.data.curation.representativeFile = buildFileSummary(file);
  }
  context.data = _.omit(data, ['shouldRepresentWorkspaceWithFile', 'representativeFileId']);
  return context;
}
