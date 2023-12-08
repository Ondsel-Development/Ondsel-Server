// add new TOS for 2023-aug-31

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {
  agreementCategoryType,
  agreementCategoryTypeMap,
  specificAgreementType
} from "../services/agreements/agreements.schema.js";
import {ObjectId} from "mongodb";
import {conformRefName, refNameHasher} from "../refNameFunctions.js";

export async function addUsernameCommand(app) {
  const userService = app.service('users');

  console.log(">>> getting users list");
  const userList = await userService.find({
    paginate: false,
  });
  console.log(`>>>   found ${userList.length} entries`)

  console.log(">>> examining each user");
  let ctr = 0;
  for (const userToChange of userList) {
    if (!userToChange.username) {
      let randomName = Math.random().toString(36).slice(2, 7);
      let username = conformRefName(randomName);
      let usernameHash = refNameHasher(username);
      console.log(`>>> updating user "${userToChange.firstName} ${userToChange.lastName}" with username "${username}" and hash ${usernameHash}`);
      await userService.patch(
        userToChange._id,
        {
          username: username,
          usernameHash: usernameHash,
        }
      );
      ctr ++;
    }
  }
  console.log(`>>> ${ctr} entries changed`);
}

