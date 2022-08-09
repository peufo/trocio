import mongoose from 'mongoose'
import type { User } from '../../types'

/**
 * Generic function for lookup an user field
 */
export const populateUser = (key: string, $project = { name: 1 }) => ({
  from: 'users',
  let: { userId: `$${key}Id` },
  pipeline: [
    {
      $match: {
        $expr: {
          $eq: ['$$userId', '$_id'],
        },
      },
    },
    {
      $project,
    },
  ],
  as: `${key}`,
})

export function lookupUser(
  aggregate: mongoose.Aggregate<unknown>,
  key: string = 'user'
): void {
  aggregate
    .lookup(populateUser(key))
    .addFields({ [key]: { $arrayElemAt: [`$${key}`, 0] } })
}
