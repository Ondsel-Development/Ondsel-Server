import {Type} from "@feathersjs/typebox";

export const keywordMatchSchema = Type.Object(
  {
    score: Type.Integer(),
    curation: Type.Any(),
  }
)

export const MAX_MATCHES_KEPT = 200;
