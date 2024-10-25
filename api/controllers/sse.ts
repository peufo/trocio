// thanks: https://github.com/sveltejs/kit/issues/5344#issuecomment-1265286081

import { Response } from 'express'

export function createSSE(res: Response) {
  let id = 0
  return {
    emitSSE({ event, data }: { event: string; data: any }) {
      let msg = `id: ${++id}\n`
      if (event) msg += `event: ${event}\n`
      if (typeof data === 'string') {
        msg += 'data: ' + data.trim().replace(/\n+/gm, '\ndata: ') + '\n\n'
      } else {
        msg += `data: ${JSON.stringify(data)}\n\n`
      }
      res.write(msg)
      res.flush()
    },
  }
}
