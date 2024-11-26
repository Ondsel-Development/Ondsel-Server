// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Type} from "@feathersjs/typebox";
import {curationSchema} from "../../curation.schema.js";

export const keywordMatchSchema = Type.Object(
  {
    score: Type.Integer(),
    curation: curationSchema,
  }
)

export const MAX_MATCHES_KEPT = 200;
