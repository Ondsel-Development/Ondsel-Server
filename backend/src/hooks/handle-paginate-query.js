export const handlePaginateQuery = context => {
  if (context.method === 'find' && context.params.query && context.params.query.hasOwnProperty('$paginate')) {
    const paginate = context.params.query.$paginate === 'false' || context.params.query.$paginate === false;
    if (paginate) {
      context.params.paginate = !paginate;
    }
    delete context.params.query.$paginate;
  }
  return context;
}
