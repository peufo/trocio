import { writable, derived, Readable } from 'svelte/store'

import type { User } from 'types'
import apiUser from '$lib/api/user'

export const userQuery = createUserQuery()

export const user = derived<typeof userQuery, User>(
  userQuery,
  ($userQuery, set) => {
    console.log('Update')
    $userQuery.then(set).catch(() => set(null))
  }
)

function createUserQuery() {
  const { subscribe, set } = writable<Promise<User>>(apiUser.authenticate())
  return {
    subscribe,
    login: (mail: string, password: string) => {
      const promise = apiUser.login(mail, password)
      set(promise)
      return promise
    },
    logout: () => set(apiUser.logout()),
  }
}

/*
export const user = userFactory()

function userFactory() {
  const { subscribe, set, update } = writable<UserStore>({ isLoading: true }, (set) => {
    apiUser.authenticate().then((user) => {
      if (!user) return set({  })
      return set({ isLogged: true, ...user })
    })
  })
  return {
    subscribe,
    set,
    update,
    login: async (mail: string, password: string) => {
        set({isLoading: true})
        apiUser.login(mail, password).then(user => {
            if (!user) return set({})
            return set({ isLogged })
        })


      try {
        let res = await fetch('/api/users/login', getHeader({ mail, password }))
        let json = await res.json()
        if (json.error) throw json.message
        loadUser(set)
        cb()
      } catch (error) {
        set(null)
        cb(error)
        notify.error(error)
      }
    },
    logout: async () => {
      try {
        let res = await fetch('/api/users/logout')
        let json = await res.json()
        if (json.error) throw json.message
        set(null)
      } catch (error) {
        notify.error(error)
      }
    },
  }
}
*/
