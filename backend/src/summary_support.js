// helper methods for distributing Summaries of documents to other documents in the context of a PATCH

export function getPriorDocumentForPatch(serviceName) {
  return async (context) => {
    if (!context.hasOwnProperty('prior_doc')) {
      context.prior_doc = {};
    }
    const service = context.app.service(serviceName);
    context.prior_doc[serviceName] = await service.get(context.id);
  }
}

export function hasDocumentChangedSummary(context, serviceName, docFieldList) {
  let result = false;
  for (const targetField of docFieldList) {
    if (context.data.hasOwnProperty(targetField)) {
      const original = context.prior_doc[serviceName][targetField];
      if (context.result[targetField] !== original) {
        result = true;
      }
    }
  }
  return result;
}
