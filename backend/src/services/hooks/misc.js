import _ from "lodash";
import {checkContext, getItems, replaceItems} from "feathers-hooks-common";

export function keepOnlyLimitedFields ( fieldNames ) {
  return context => {
    checkContext(context, 'after');
    // Retrieve the items from the hook
    const items = getItems(context);
    if (!items) return;
    let newUsers = [];
    items.forEach((user) => {
      newUsers.push(_.pick(user, fieldNames));
    });
    // Replace the items within the hook
    replaceItems(context, newUsers);
    return context;
  }
}
