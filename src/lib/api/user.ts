import axios from 'axios'
import type { User } from 'types'
import notify from '$lib/notify'

interface UserResponse extends User {
  error?: boolean
  success?: boolean
  message?: string
}

export function authenticate() {
  return axios
    .get<UserResponse>('/api/users/me')
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw error
    })
}

export function login(mail: string, password: string) {
  return axios
    .post<UserResponse>('/api/users/login', { mail, password })
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.success(`Bienvenu ${data.name}`)
      return data
    })
    .catch((error) => {
      throw notify.error(error.response?.data?.message || error)
    })
}

export function logout() {
  return axios
    .get<UserResponse>('/api/users/logout')
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.success('Au revoir 👋')
      return null
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

export default { authenticate, login, logout }
