export async function addMessagesFieldsToSharedModelsCommand(app) {
  const sharedModelsService = app.service('shared-models');
  const db = await sharedModelsService.options.Model;
  try {
    // Update shared models where 'messages' field does not exist
    const result = await db.updateMany(
      { messages: { $exists: false } },
      { $set: { messages: [], messagesParticipants: [] } }
    );
    console.log(result);
    console.log('Migration successful.');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
