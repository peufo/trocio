import type {
  GetNextPageParamFunction,
  UseInfiniteQueryResult,
} from "@tanstack/svelte-query";

/**
 * Find and update an item on infinit result pages
 * @param store
 * @param item
 * @return infinitResults updated
 * @deprecated
 */
export function setItemById(
  infinitResult: UseInfiniteQueryResult<any[]>,
  newItem: { _id: string } & any
) {
  return {
    ...infinitResult,
    data: {
      pages: infinitResult.data.pages.map((page) =>
        page.map((item) => (item._id === newItem._id ? newItem : item))
      ),
    },
  };
}
