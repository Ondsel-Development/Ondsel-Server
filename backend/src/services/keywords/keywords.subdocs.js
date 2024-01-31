import {Type} from "@feathersjs/typebox";

export const keywordMatchSchema = Type.Object(
  {
    score: Type.Integer(),
    summary: Type.Any(),
  }
)

