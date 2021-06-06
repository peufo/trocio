import axios, { Method } from 'axios'
import notify from '$lib/notify'

import type { BaseResponse, ResponseNotifyOptions } from 'types'

export function api<TypeRequest, TypeResponse = TypeRequest>(
  url: string,
  options: Partial<
    {
      method: Method
      /** Params passed to query of request */
      params: { skip?: number; limit?: number } & any
      /** Data passed on body of resquest*/
      data: Partial<TypeRequest>
      /** Wrapper to format returned data */
      format: (data: TypeResponse) => TypeResponse
    } & ResponseNotifyOptions<TypeResponse>
  > = {}
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
    .request<TypeResponse & BaseResponse>({ url, method, params, data })
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
