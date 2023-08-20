import {BadRequest} from "@feathersjs/errors";
import {changeTierNames} from "../businessLogic/change-tier-names.js";

export const doDbMigration = async (context) => {
  const action = context.data.action;
  const PIN = context.data.activationPIN;
  context.data.activationPIN = null;
  const dateCompleted = await completedAlready(action, context);
  if (dateCompleted !== null) {
    throw new BadRequest(`The db-migration called '${action}' was already been completed on ${dateCompleted}.`)
  }
  switch (action) {
    // case 'example-change':  // commented out on 2023-08-20
    //   await exampleChange(context, PIN);
    //   break;
   case 'change-tier-names':
     await changeTierNames(context, PIN);
     break;
    default:
      throw new BadRequest(`There is no active db-migration called '${action}' with that PIN.`)
  }
  return context;
}

async function completedAlready(action, context){
  const dbmService = context.app.service('db-migration');
  const result = await dbmService.find({
    query: {
      $limit: 4,
      $skip: 0,
      $sort: {
        completedOn: -1,
      },
      action: action
    }
  });
  if (result.data.length > 0) {
    const dbm = result.data[0];
    const dbmCompletedOn = new Date(dbm.completedOn);
    const dateString = dbmCompletedOn.toString();
    return dateString;
  }
  return null;
}