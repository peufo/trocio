import { writable, derived } from 'svelte/store'

import type { User } from 'types'
import type { AxiosError } from 'axios'
import apiUser from '$lib/user/api'
import { useInfiniteQuery } from '@sveltestack/svelte-query'
import { getNextPageParam } from '$lib/store/util'

export const userQuery = createUserQuery()

export const userStatus = derived<
  typeof userQuery,
  {
    isLoading: boolean
    isSuccess?: boolean
    isError?: boolean
  }
>(userQuery, ($userQuery, set) => {
  set({ isLoading: true })
  $userQuery
    .then(() => set({ isLoading: false, isSuccess: true }))
    .catch(() => set({ isLoading: false, isError: true }))
})

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

    changePassword: (oldPassword: string, newPassword: string) =>
      apiUser.changePassword(oldPassword, newPassword),
  }
}

function createSetAndReturnPromise(
  set: (this: void, value: Promise<User>) => void
) {
  return (promise: Promise<User>) => {
    set(promise)
    return promise
  }
}

export function useSearchUserOptions(searchValue: string) {
  return {
    queryKey: ['searchUser', searchValue],
    queryFn: apiUser.search,
    getNextPageParam,
  }
}

export const useSearchUser = (searchValue: string) =>
  useInfiniteQuery<User[], AxiosError>(useSearchUserOptions(searchValue))
