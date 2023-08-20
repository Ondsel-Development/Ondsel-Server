// import {BadRequest} from "@feathersjs/errors";
//
// export async function exampleChange(context, PIN) {
//   if (PIN !== '123456') {
//     // A PIN code is not true form of security. It is mostly used prevent typos and accidents.
//     // More important:
//     //
//     // 1. The code written must be safe to run multiple times and by a hacker. If this isn't true, then
//     //    a different form of migration should be used.
//     // 2. The code must be commented out in a later release after all migrations are completed. It isn't
//     //    deleted since a historical record might be valuable. But there is no reason to keep it active.
//     // 3. Errors should be handled with a thrown error so that a document is not stored; which would
//     //    block future retries.
//     throw new BadRequest("Wrong PIN used.");
//   };
//   //
//   // work would go here
//   //
//   context.data.resultMsg = 'SUCCESS';
// }
