import { app } from '../app.js';
import { migrateOldModelsCommand } from './migrate-models.command.js';

async function runMigration() {
  console.log('Migration start');
  const command = process.argv[2];
  switch (command) {
    case 'migrateOldModels':
      await migrateOldModelsCommand(app);
      break;
    default:
      console.error('Please specify the migration command.')
      process.exit(1);
  }
  console.log('Migration successfully applied!');
  process.exit(1);
}

runMigration().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
