import {ObjectIdSchema, Type} from "@feathersjs/typebox";

export const stripeEventsDataSchema = Type.Object(
  {
    object: stripeEventsDataObjectSchema,
    livemode: Type.Boolean(),
    pending_webhooks: Type.Integer(),
    request: Type.Any(),
    type: Type.String()
  }
)

export const stripeEventsDataObjectSchema = Type.Object(
  {
    id: Type.String(), // "seti_1NG8Du2eZvKYlo2C9XMqbR0x",
    object: Type.String(), // "setup_intent",
    application: Type.Any(),
    automatic_payment_methods: Type.Any(), // null,
    cancellation_reason: Type.String(), // null,
    client_secret: Type.String(),
    created: Type.Integer(), // datetime
    customer: Type.Any(),
    description: Type.String(),
    flow_directions: Type.Any(),
    last_setup_error: Type.Any(),
    latest_attempt: Type.Any(),
    livemode: Type.Boolean(),
    mandate: Type.Any(),
    metadata: Type.Any(),
    next_action: Type.Any(),
    on_behalf_of: Type.Any(),
    payment_method: Type.String(),
    payment_method_options: Type.Any(),
    payment_method_types: Type.Array<Type.String>(),
    single_use_mandate: Type.Any(),
    status: Type.String(),
    usage: Type.String(),
  }
)

export const stripeEventsProcessedSchema = Type.Object(
  {
    done: Type.Boolean(),
    doneAt: Type.Integer(),
    detail: Type.String(),
    other: Type.Any(),
  }
)
