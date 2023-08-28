import { app } from '../app.js';
import { migrateOldModelsCommand } from './migrate-models.command.js';
import {updateTierNames} from "./update-tier-names.command.js";
import {addInitialTosPp} from "./add-initial-tos-pp.js";
import { migrateOldFilesCommand } from './migrate-old-files.command.js';

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
    case 'updateTierNames':
      await updateTierNames(app);
      break;
    case 'addInitialTosPp':
      await addInitialTosPp(app);
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
