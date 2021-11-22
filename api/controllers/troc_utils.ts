//return an error if not OK
export function scheduleValidation({ schedule }) {
  if (
    schedule &&
    schedule[0] &&
    new Date(schedule[0].open).getTime() <
      new Date().getTime() + 1000 * 60 * 60 * 4
  )
    return Error(`The troc cannot start in less than 4 hours`)
  return null
}
