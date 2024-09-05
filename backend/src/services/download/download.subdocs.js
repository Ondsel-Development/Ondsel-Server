import {ObjectIdSchema, Type} from "@feathersjs/typebox";

export const downloadSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    fileKey: Type.String(),
    url: Type.String(),
  }
)

export function buildDownloadSummary(download, url='') {
  const result = {
    _id: download._id,
    fileKey: download.fileKey,
    url: url,
  }
  return result;
}