// merge first and last name to new 'name' field.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {
  agreementCategoryType,
  agreementCategoryTypeMap,
  specificAgreementType
} from "../services/agreements/agreements.schema.js";
import {ObjectId} from "mongodb";
import {conformName, usernameHasher} from "../usernameFunctions.js";

export async function mergeFirstLastNameCommand(app) {
  const userService = app.service('users');

  console.log(">>> getting users list");
  const userList = await userService.find({
    paginate: false,
  });
  console.log(`>>>   found ${userList.length} entries`)

  console.log(">>> examining each user");
  let ctr = 0;
  for (const userToChange of userList) {
    if (!userToChange.name) {
      const firstName = userToChange.firstName.trim();
      const lastName = userToChange.lastName.trim();
      let newName = "";
      if (firstName && lastName) {
        newName = `${firstName} ${lastName}`;
      } else if (firstName) {
        newName = firstName;
      } else {
        newName = lastName;
      }
      console.log(`>>>   updating user "${firstName} ${lastName}" to "${newName}"`);
      await userService.patch(
        userToChange._id,
        {
          name: newName,
          firstName: undefined,
          lastName: undefined,
        }
      );
      ctr ++;
    }
  }
  console.log(`>>> ${ctr} entries changed`);
}
