import axios from 'axios'
import type { User } from 'types'
import notify from '$lib/notify'

interface BaseResponse {
  error?: boolean
  success?: boolean
  message?: string
}

type Res = { success: string; error: false } | { success: false; error: string }

interface UserResponse extends BaseResponse, User {}

/**
 * Connection de l'utilisateur
 * Est automatiquement redirigé vers authenticate
 */
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

/**
 * Verification de la connection de l'utilisateur
 */
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

/**
 * Déconnection de l'utilisateur
 */
export function logout() {
  return axios
    .get<BaseResponse>('/api/users/logout')
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.success('Au revoir 👋')
      return null
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

/**
 * Création d'un nouveau compte utilisateur
 */
export function register(name: string, mail: string, password: string) {
  return axios
    .post<UserResponse>('/api/users', { name, mail, password })
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.success(`Bienvenu ${data.name}`)
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

/**
 * Réinitialisation du mot de passe
 */
export function recover(mail: string) {
  return axios
    .post<BaseResponse>('/api/users/resetpwd', { mail })
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.info(`Votre nouveau mot de passe vous à été envoyé par mail`)
      return null
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

/**
 * Mise à jour des infos utilisateur
 */
export function update(newValue: Partial<User>) {
  return axios
    .patch<UserResponse>('/api/users/me', newValue)
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.success('Profil mis à jour')
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

/**
 * Evoyer un mail de vaildation
 */
export function sendValidationMail() {
  return axios
    .post<BaseResponse>('/api/users/validmail')
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.success('Un mail de validation vous à été envoyé')
      return null
    })
    .catch((error) => {
      throw notify.error(error)
    })
}
export function validMail(validator: string) {
  return axios
    .get<BaseResponse>(`/api/users/validmail/${validator}`)
    .then(({ data }) => {
      if (data.error) throw data.message
      notify.success('Votre mail est vaildé')
      return { mailvalided: true }
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

export function changePassword(oldPassword: string, newPassword: string) {
  return axios
    .post<BaseResponse>('/api/users/changepwd', { oldPassword, newPassword })
    .then(({ data }) => {
      if (data.error) throw data.message || 'error'
      notify.success('Changement du mot de passe accepté')
      return null
    })
    .catch((error) => {
      throw notify.error(error)
    })
}
/*
  try {
    let res = await fetch(
      '/api/users/changepwd',
      getHeader({ oldPassword, newPassword })
    )
    let json = await res.json()
    if (!json.success) throw json.message
    changePassword = false
    oldPassword = ''
    newPassword = ''
    newPassword2 = ''
  } catch (error) {
    notify.error(error)
  }
}
*/

export default {
  login,
  authenticate,
  logout,
  register,
  recover,
  update,
  sendValidationMail,
  validMail,
  changePassword,
}
