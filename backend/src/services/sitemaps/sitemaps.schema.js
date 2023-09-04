// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import {Type, getValidator, querySyntax, StringEnum} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

export const websiteTargetTypeMap = {
  shareOndselCom: 'share.ondsel.com',
}
export const websiteTargetType = StringEnum([
  websiteTargetTypeMap.shareOndselCom,
])

export const sitemapUrlType = Type.Object(
  {
    refId: ObjectIdSchema(),
    loc: Type.String(),
    lastMod: Type.String(),
  }
)

// Main data model schema
export const sitemapsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    websiteTarget: websiteTargetType,
    lastUpdate: Type.Number(),
    urls:  Type.Array(sitemapUrlType),
  },
  { $id: 'Sitemaps', additionalProperties: false }
)
export const sitemapsValidator = getValidator(sitemapsSchema, dataValidator)
export const sitemapsResolver = resolve({})

export const sitemapsExternalResolver = resolve({})

// Schema for creating new entries
export const sitemapsDataSchema = Type.Pick(sitemapsSchema, [
  'websiteTarget',
  'lastUpdate',
  'urls',
], {
  $id: 'SitemapsData'
})
export const sitemapsDataValidator = getValidator(sitemapsDataSchema, dataValidator)
export const sitemapsDataResolver = resolve({})

// Schema for updating existing entries
export const sitemapsPatchSchema = Type.Partial(sitemapsSchema, {
  $id: 'SitemapsPatch'
})
export const sitemapsPatchValidator = getValidator(sitemapsPatchSchema, dataValidator)
export const sitemapsPatchResolver = resolve({})

// Schema for allowed query properties
export const sitemapsQueryProperties = Type.Pick(sitemapsSchema, ['_id', 'websiteTarget'])
export const sitemapsQuerySchema = Type.Intersect(
  [
    querySyntax(sitemapsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const sitemapsQueryValidator = getValidator(sitemapsQuerySchema, queryValidator)
export const sitemapsQueryResolver = resolve({})
