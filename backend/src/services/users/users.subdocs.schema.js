// subdocuments used by users.schema.js and users of that schema

import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'

export const userSummarySchema = Type.Object(
    {
        userId: ObjectIdSchema(),
        name: Type.String(),
    }
)

const Ledger = StringEnum(
    [
        'Cash',
        'ProcessorExpense',
        'UnearnedRevenue',
        'Revenue',
        'Refunds'
    ]
)

export const journalTransactionSchema = Type.Object(
    {
        id: ObjectIdSchema(),
        time: Type.Number(),
        description: Type.String(),
        entries: Type.Array(Type.Object(journalElementSchema))
    }
)
export const journalElementSchema = Type.Object(
    {
        ledger: Ledger,
        amount: Type.Integer()
    }
)

export const userAccountingSchema = Type.Object(
    {
        ledgerBalances: Type.Object(
            {
                cash: Type.Integer(), // ASSET; base10 decimal not supported by feathersjs; so store money in integer pennies
                processorExpense: Type.Integer(), // EXPENSE
                unearnedRevenue: Type.Integer(), // INCOME
                revenue: Type.Integer(), // INCOME
                refunds: Type.Integer(), // inverted INCOME (EXPENSE)
            }
        ),
        journal: Type.Array(journalTransactionSchema),
    }
)
