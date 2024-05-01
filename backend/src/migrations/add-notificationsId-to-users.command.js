
export async function addNotificationsIdToUsersCommand(app) {
  const userService = app.service('users');
  const ntfService = app.service('notifications');

  console.log(">>> getting users list");
  const userList = await userService.find({
    paginate: false,
  });
  console.log(`>>>   found ${userList.length} entries`)

  console.log(">>> examining each user");
  let ctr = 0;
  for (const userToChange of userList) {
    if (!userToChange.notificationsId) {
      console.log(`>>> updating user "${userToChange.username}".`);
      const ntfDoc = await ntfService.create(
        {
          userId: userToChange._id,
          notificationsReceived: [],
        }
      );
      await userService.patch(
        userToChange._id,
        {
          notificationsId: ntfDoc._id,
        }
      );
      ctr ++;
    }
  }
  console.log(`>>> ${ctr} entries changed`);
}
