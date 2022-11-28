import type { Aggregate } from 'mongoose'

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
  aggregate: Aggregate<unknown>,
  key: string = 'user',
  $project: { [key: string]: 0 | 1 } = {}
): void {
  aggregate
    .lookup(populateUser(key, { name: 1, ...$project }))
    .addFields({ [key]: { $arrayElemAt: [`$${key}`, 0] } })
}
