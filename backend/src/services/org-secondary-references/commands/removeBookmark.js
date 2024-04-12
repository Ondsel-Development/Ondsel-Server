import _ from "lodash";
import {BadRequest} from "@feathersjs/errors";


export const removeBookmark = async context => {
  const {data} = context;

  if (!data.bookmarkId) {
    throw new BadRequest('bookmarkId is mandatory');
  }

  const orgSecondaryReferences = await context.service.get(context.id);
  let { bookmarks } = orgSecondaryReferences;

  bookmarks = bookmarks.filter(bm => bm._id.toString() !== data.bookmarkId);

  context.data.bookmarks = bookmarks;
  context.data = _.omit(data, ['shouldRemoveBookmark', 'bookmarkId']);
  return context;
}
