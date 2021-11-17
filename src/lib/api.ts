import axios, { AxiosError, Method } from 'axios'
import notify from '$lib/notify'

import type { BaseResponse, ResponseNotifyOptions } from 'types'
import {
  GetNextPageParamFunction,
  QueryFunction,
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@sveltestack/svelte-query'

type ApiOptions<RequestQuery, RequestResult = RequestQuery> = Partial<
  {
    method: Method
    /** Params passed to query of request */
    params: { skip?: number; limit?: number } & any
    /** Data passed on body of resquest*/
    data: Partial<RequestQuery>
    /** Wrapper to format returned data */
    format: (data: RequestResult) => RequestResult
  } & ResponseNotifyOptions<RequestResult>
>

export function api<RequestQuery = any, RequestResult = RequestQuery>(
  url: string,
  options: ApiOptions<RequestQuery, RequestResult> = {}
) {
  let {
    method = 'get',
    params = {},
    data = {},
    format = (data) => data,
    success = false,
    info = false,
    error = true,
  } = options

  return axios
    .request<RequestResult & BaseResponse>({
      url,
      method,
      params,
      data,
      validateStatus: (httpStatus) => httpStatus <= 404,
    })
    .then(({ data }) => {
      if (data.error) throw data.message

      if (success === true) notify.success(data.message)
      else if (typeof success === 'string') notify.success(success)
      else if (typeof success === 'function') notify.success(success(data))

      if (info === true) notify.info(data.message)
      else if (typeof info === 'string') notify.info(info)
      else if (typeof info === 'function') notify.info(info(data))

      return format(data)
    })
    .catch((requestError) => {
      if (error === true) notify.error(requestError)
      else if (typeof error === 'string') notify.error(error)
      else if (typeof error === 'function') notify.error(error(requestError))

      throw requestError
    })
}

export function useApi<RequestQuery, RequestResult>(
  queryOptions:
    | [string, RequestQuery]
    | UseQueryOptions<
        RequestResult,
        AxiosError,
        RequestResult,
        [string, RequestQuery]
      >,
  apiOptions: ApiOptions<RequestQuery, RequestResult> = {}
) {
  const queryFn: QueryFunction<RequestResult, [string, RequestQuery]> = (
    context
  ) => {
    return api<RequestQuery, RequestResult>(`/api/${context.queryKey[0]}`, {
      params: context.queryKey[1],
      ...apiOptions,
    })
  }

  if (Array.isArray(queryOptions))
    return useQuery({ queryFn, queryKey: queryOptions })
  return useQuery({ queryFn, ...queryOptions })
}

interface UseInfiniteApiQueryOptions<RequestQuery, RequestResult>
  extends UseInfiniteQueryOptions<
    RequestResult,
    AxiosError,
    RequestResult,
    RequestResult,
    [string, RequestQuery]
  > {}

export function useInfinitApi<RequestQuery = any, RequestResult = RequestQuery>(
  queryOptions:
    | [string, RequestQuery]
    | UseInfiniteApiQueryOptions<RequestQuery, RequestResult>,
  apiOptions: ApiOptions<RequestQuery, RequestResult> = {},
  firstLimit = 10,
  nextLimit = firstLimit
) {
  const queryFn = (context: QueryFunctionContext<[string, RequestQuery]>) => {
    const params = {
      ...context.queryKey[1],
      skip: context.pageParam,
      limit: context.pageParam ? nextLimit : firstLimit,
    }

    return api<RequestQuery, RequestResult>(`/api/${context.queryKey[0]}`, {
      params,
      ...apiOptions,
    })
  }

  const getNextPageParam: GetNextPageParamFunction<RequestResult> = (
    lastPage,
    allPages
  ) => {
    if (!Array.isArray(lastPage)) return
    if (allPages.length === 1) {
      if (lastPage.length < firstLimit) return
      return firstLimit
    } else if (allPages.length > 1) {
      if (lastPage.length < nextLimit) return
      return allPages.flat().length
    }
  }

  if (Array.isArray(queryOptions))
    return useInfiniteQuery({
      queryFn,
      getNextPageParam,
      queryKey: queryOptions,
    })
  return useInfiniteQuery({
    queryFn,
    getNextPageParam,
    ...queryOptions,
  })
}

/** @deprecated */
export function createGetNextPageParam<TQueryFnData>(
  /** First limit  */
  start: number,
  /** Next limit */
  next = start
): GetNextPageParamFunction {
  return function getNextPageParam(
    lastPage: TQueryFnData,
    allPages: TQueryFnData[]
  ): unknown {
    if (!Array.isArray(lastPage)) return
    if (allPages.length === 1) {
      if (lastPage.length < start) return
      return start
    } else if (allPages.length > 1) {
      if (lastPage.length < next) return
      return allPages.flat().length
    }
  }
}
