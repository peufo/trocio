import axios, { type AxiosError, type Method } from "axios";

import notify from "$lib/notify";
import type { BaseResponse, ResponseNotifyOptions } from "$lib/types";
import {
  createQuery,
  createInfiniteQuery,
  type GetNextPageParamFunction,
  type QueryFunction,
  type QueryFunctionContext,
  type CreateInfiniteQueryOptions,
  type CreateQueryOptions,
  type InfiniteQueryObserverResult,
  type InfiniteData,
  type InfiniteQueryObserverOptions,
} from "@tanstack/svelte-query";
import { writable } from "svelte/store";

type ApiOptions<RequestQuery, RequestResult = RequestQuery> = Partial<
  {
    method: Method;
    /** Params passed to query of request */
    params: { skip?: number; limit?: number } & any;
    /** Data passed on body of resquest*/
    data: Partial<RequestQuery>;
    /** Wrapper to format returned data */
    format: (data: RequestResult) => RequestResult;
  } & ResponseNotifyOptions<RequestResult>
>;

export async function api<RequestQuery = any, RequestResult = RequestQuery>(
  url: string,
  {
    method = "get",
    params = {},
    data = {},
    format = (data) => data,
    success = false,
    info = false,
    error = true,
  }: ApiOptions<RequestQuery, RequestResult> = {}
) {
  try {
    const res = await axios.request<RequestResult & BaseResponse>({
      url,
      method,
      params,
      data,
      validateStatus: (httpStatus_1) => httpStatus_1 <= 404,
    });
    if (res.data.error) throw res.data.message;

    if (success === true) notify.success(res.data.message as string);
    else if (typeof success === "string") notify.success(success);
    else if (typeof success === "function") notify.success(success(res.data));

    if (info === true) notify.info(res.data.message as string);
    else if (typeof info === "string") notify.info(info);
    else if (typeof info === "function") notify.info(info(res.data));
    return format(res.data);
  } catch (requestError) {
    if (error === true) {
      if (typeof requestError === "string") notify.error(requestError);
      console.error(requestError);
    } else if (typeof error === "string") notify.error(error);
    else if (typeof error === "function") notify.error(error(requestError));

    throw requestError;
  }
}

type QueryOptions<RequestQuery, RequestResult> =
  | string
  | [string, RequestQuery]
  | CreateQueryOptions<
      RequestResult,
      AxiosError,
      RequestResult,
      [string, RequestQuery]
    >;

export function useApi<RequestQuery, RequestResult = RequestQuery>(
  queryOptions: QueryOptions<RequestQuery, RequestResult>,
  apiOptions: ApiOptions<RequestQuery, RequestResult> = {}
) {
  const queryFn: QueryFunction<RequestResult, [string, RequestQuery?]> = (
    context
  ) => {
    const url = `/api/${context.queryKey[0]}`;
    const params = context.queryKey[1] || {};
    return api<RequestQuery, RequestResult>(url, {
      params,
      ...apiOptions,
    });
  };

  if (Array.isArray(queryOptions))
    return createQuery({ queryFn, queryKey: queryOptions });
  if (typeof queryOptions === "string")
    return createQuery({ queryFn, queryKey: [queryOptions] });
  return createQuery({ queryFn, ...queryOptions });
}

export function useInfinitApi<RequestQuery = any, RequestResult = RequestQuery>(
  queryKeys: [string, RequestQuery],
  apiOptions: ApiOptions<RequestQuery, RequestResult> = {},
  firstLimit = 20,
  nextLimit = firstLimit
) {
  const queryFn = (context: QueryFunctionContext<[string, RequestQuery]>) => {
    const params = {
      ...context.queryKey[1],
      skip: context.pageParam,
      limit: context.pageParam ? nextLimit : firstLimit,
    };

    return api<RequestQuery, RequestResult>(`/api/${context.queryKey[0]}`, {
      params,
      ...apiOptions,
    });
  };

  const getNextPageParam: GetNextPageParamFunction<number> = (
    lastPage,
    allPages
  ) => {
    if (!Array.isArray(lastPage)) return;
    if (allPages.length === 1) {
      if (lastPage.length < firstLimit) return;
      return firstLimit;
    } else if (allPages.length > 1) {
      if (lastPage.length < nextLimit) return;
      return allPages.flat().length;
    }
  };

  return createInfiniteQuery({
    queryFn,
    initialPageParam: 0,
    getNextPageParam,
    queryKey: queryKeys,
  });
}
