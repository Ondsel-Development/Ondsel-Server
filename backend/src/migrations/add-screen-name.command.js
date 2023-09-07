// add new TOS for 2023-aug-31

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {
  agreementCategoryType,
  agreementCategoryTypeMap,
  specificAgreementType
} from "../services/agreements/agreements.schema.js";
import {ObjectId} from "mongodb";
import {conformName, screenNameHasher} from "../screenNameFunctions.js";

export async function addScreenNameCommand(app) {
  const userService = app.service('users');

  console.log(">>> getting users list");
  const userList = await userService.find({
    paginate: false,
  });
  console.log(`>>>   found ${userList.length} entries`)

  console.log(">>> examining each user");
  let ctr = 0;
  for (const userToChange of userList) {
    if (!userToChange.screenName) {
      let screenName = conformName(`${userToChange.firstName} ${userToChange.lastName}`);
      let screenNameHash = screenNameHasher(screenName);
      console.log(`>>> updating user "${userToChange.firstName} ${userToChange.lastName}" with screenName "${screenName}" and hash ${screenNameHash}`);
      await userService.patch(
        userToChange._id,
        {
          screenName: screenName,
          screenNameHash: screenNameHash,
        }
      );
      ctr ++;
    }
  }
  console.log(`>>> ${ctr} entries changed`);
}

