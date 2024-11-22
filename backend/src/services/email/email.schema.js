// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ObjectIdSchema, Type} from "@feathersjs/typebox";

// This schema is strictly a courtesy for the Swagger page; this is never stored anywhere.
export const emailSchema = Type.Object(
  {
    from: Type.String(),
    to: Type.String(),
    cc: Type.String(),
    bcc: Type.String(),
    subject: Type.String(),
    text: Type.String(),
    html: Type.String(),
    attachments: Type.Array(Type.String())
  },
  { $id: 'Email', additionalProperties: false }
)
