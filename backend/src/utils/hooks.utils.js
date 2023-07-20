import { setField } from 'feathers-hooks-common';

export const limitToUser = setField({
  from: 'params.user._id',
  as: 'params.query.userId'
});
