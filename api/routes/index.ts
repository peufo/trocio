import express from 'express'
import got from 'got'

import type { OpenCageResult } from '../../types'
import config from '../../config'
const router = express.Router()

router.get('/geocode/:query', (req, res, next) => {
  if (!config.TROCIO_OCD_API_KEY)
    return next(
      Error(
        'Variable environement TROCIO_OCD_API_KEY is undefined ! Please visite https://opencagedata.com/api'
      )
    )
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${req.params.query}&language=fr&key=${config.TROCIO_OCD_API_KEY}`
  got<OpenCageResult>(url, { responseType: 'json' })
    .then((response) => {
      if (!response.body.results) return next(Error('No result'))
      const formatted = response.body.results.map((r) => {
        return {
          address: r.formatted,
          location: r.geometry,
          _type: r.components._type,
          country_code: r.components.country_code,
          currency: r.annotations?.currency?.iso_code,
        }
      })
      res.json(formatted)
    })
    .catch(next)
})

export default router
