import type { RequestHandler } from 'express'

import Option from '../models/option'
import type { OptionNameEnum } from '../../types'

/**
 * Permet de maintenir les options en cache pour éviter d'appeler la DB
 * Définit également les options par défauts
 */
const OPTIONS: {
  [key in OptionNameEnum]: { value: string; description: string }
} = {
  FREE_TROC: {
    value: '5',
    description:
      'Nombre de troc autorisé avant bloquage. Il faut ensuite accorder des crédits',
  },
}

/** Ecrit les options par défaut dans la DB et initialise le cache */
export async function initOptions() {
  try {
    const options = await Option.find({}).exec()
    const optionsNames = options.map((o) => o.name as string)

    for (const name in OPTIONS) {
      if (optionsNames.includes(name)) {
        OPTIONS[name] = options.find((o) => o.name === name)
      } else {
        const newOption = new Option({ name, ...OPTIONS[name] })
        await newOption.save()
      }
    }

    console.log(`Options initialised`)
  } catch (error) {
    console.error(`Options init failed`)
    console.error(error)
  }
}

export const getOptions: RequestHandler = async (req, res, next) => {
  try {
    const options = await Option.find({}).exec()
    res.json(options)
  } catch (error) {
    next(error)
  }
}

export const setOption: RequestHandler = async (req, res, next) => {
  try {
    const { _id, name, value } = req.body
    if (typeof value !== 'string') throw 'value string is required in body'
    if (!_id && !name) throw '_id or name are required in body'
    const query = _id ? { _id } : { name }
    const option = await Option.findOneAndUpdate(query, { value })
    if (!option) throw new Error('option not found')
    option.value = value
    OPTIONS[option.name].value = value
    res.json(option)
  } catch (error) {
    next(error)
  }
}

export function getOpt(name: OptionNameEnum) {
  return OPTIONS[name].value
}
