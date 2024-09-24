import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";
import {curationSchema} from "../../curation.schema.js";

export const agreementCategoryTypeMap = {
  privacyPolicy: 'privacy-policy',
  termsOfService: 'terms-of-service',
  lensSiteCuration: 'lens-site-curation',
  signupSurveyPrompt: 'signup-survey-prompt', // this contains the "prompt" for the survey, not the survey itself
}
export const agreementCategoryType = StringEnum([
  agreementCategoryTypeMap.privacyPolicy,
  agreementCategoryTypeMap.termsOfService,
  agreementCategoryTypeMap.lensSiteCuration,
  agreementCategoryTypeMap.signupSurveyPrompt,
])

export const specificAgreementType = Type.Object(
  {
    agreementDocId: ObjectIdSchema(),
    title: Type.String(),
    effective: Type.Number(), // a formal date
    deprecated: Type.Union([Type.Number(), Type.Null()]), // null means not deprecated yet
    version: Type.String(),
    markdownContent: Type.String(),
    curation: Type.Optional(Type.Any()), // a curationSchema but I'm getting a circular ref error if I use that directly
                                         // curation for agreement doc is strictly utility; it does NOT generate keywords
    docPostedAt: Type.Number(), // when this was uploaded to db
  }
)

