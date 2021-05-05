import { writable, derived, Updater } from 'svelte/store'

import type { User } from 'types'
import apiUser from '$lib/api/user'

interface Status {
  isLoading: boolean
  isSuccess?: boolean
  isError?: boolean
}

export const userQuery = createUserQuery()

export const userStatus = derived<typeof userQuery, Status>(
  userQuery,
  ($userQuery, set) => {
    set({ isLoading: true })
    $userQuery
      .then(() => set({ isLoading: false, isSuccess: true }))
      .catch(() => set({ isLoading: false, isError: true }))
  }
)

export const user = derived<typeof userQuery, User>(
  userQuery,
  ($userQuery, set) => {
    $userQuery.then(set).catch(() => set(null))
  }
)

function createUserQuery() {
  const { subscribe, set, update } = writable<Promise<User>>(
    apiUser.authenticate()
  )

  const setAndReturnPromise = createSetAndReturnPromise(set)

  return {
    subscribe,

    set: (value: User) => setAndReturnPromise(Promise.resolve(value)),

    login: (mail: string, password: string) =>
      setAndReturnPromise(apiUser.login(mail, password)),

    register: (name: string, mail: string, password: string) =>
      setAndReturnPromise(apiUser.register(name, mail, password)),

    logout: () => setAndReturnPromise(apiUser.logout()),

    recover: (mail: string) => setAndReturnPromise(apiUser.recover(mail)),

    update: (newValue: Partial<User>) =>
      setAndReturnPromise(apiUser.update(newValue)),

    sendValidationMail: apiUser.sendValidationMail,

    validMail: (validator: string) => apiUser.validMail(validator),
  }
}

type AsyncFunction<Tres> = (...args: any) => Promise<Tres>

/**
 * Initialise le set du setter
 */
function createSetAndReturnPromise(
  set: (this: void, value: Promise<User>) => void
) {
  return (promise: Promise<User>) => {
    set(promise)
    return promise
  }
}

/**
 * Passe la promesse en argument à set() avant de la retourner
 * Util si l'appel de la méthode à besoin d'utilisé .then()
 */
/*
function setAndReturnPromise(
  set: (this: void, value: Promise<User>) => void,
  promise: Promise<User>
) {
  set(promise)
  return promise
}
*/
