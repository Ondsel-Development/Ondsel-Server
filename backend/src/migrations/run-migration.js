import { app } from '../app.js';
import { migrateOldModelsCommand } from './migrate-models.command.js';
import { migrateOldFilesCommand } from './migrate-old-files.command.js';
import {addUsernameCommand} from "./add-username.command.js";
import { migrateObjectsForSharedWorkspaceCommand } from './shared-workspace.command.js';
import { mergeFirstLastNameCommand } from "./merge-first-last-name.command.js";
import {updateModelsForFilesCommand} from "./update-models-for-files.command.js";
import { migrateWorkspaceGroupsOrUsersCommand } from "./update-workspace-groupsOrUsers.js";

async function runMigration() {
  console.log('Migration start');
  const command = process.argv[2];
  switch (command) {
    case 'migrateOldModels':
      await migrateOldModelsCommand(app);
      break;
    case 'migrateOldFiles':
      await migrateOldFilesCommand(app);
      break;
    // case 'updateTierNames':
    //   await updateTierNames(app);
    //   break;
    // case 'addInitialTosPp':
    //   await addInitialTosPp(app);
    //   break;
    // case 'updateTos2023Aug31':
    //   await updateTos2023Aug31Command(app);
    //   break;
    // case 'addUsername':
    //   await addUsernameCommand(app);
    //   break;
    // case 'mergeFirstLastName':
    //   await mergeFirstLastNameCommand(app);
    //   break;
    case 'updateModelsForFiles':
      await updateModelsForFilesCommand(app);
      break;
    case 'migrateObjectsForSharedWorkspace':
      await migrateObjectsForSharedWorkspaceCommand(app);
      break;
    case 'migrateWorkspaceGroupsOrUsers':
      await migrateWorkspaceGroupsOrUsersCommand(app);
      break;
    default:
      console.error('Please specify the migration command.')
      process.exit(1);
  }
  console.log('Migration successfully applied!');
  process.exit(0);
}

runMigration().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
