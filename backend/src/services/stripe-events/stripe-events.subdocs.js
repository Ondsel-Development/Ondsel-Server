import {Type} from "@feathersjs/typebox";


export const stripeEventsRequest = Type.Object(
  {
    id: Type.String(),
    idempotency_key: Type.String(),
  }
)

// export const stripeEventsExampleObject = Type.Object(
//   {
//     id: Type.String(),
//     object: Type.Literal("example"),
//     x: Type.String(),
//   }
// )