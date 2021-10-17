import { api } from '$lib/api'
import type { BaseResponse, User } from 'types'

/**
 * Connection de l'utilisateur
 * Est automatiquement redirigé vers authenticate
 */
export function login(mail: string, password: string) {
  return api<User>('/api/users/login', {
    method: 'post',
    data: { mail, password },
    success: (data) => `Bienvenu ${data.name}`,
  })
}

/**
 * Verification de la connexion de l'utilisateur
 */
export function authenticate() {
  return api<User>('/api/users/me')
}

/**
 * Déconnection de l'utilisateur
 */
export function logout() {
  return api('/api/users/logout', {
    success: 'Au revoir 👋',
    format: () => null,
  })
}

/**
 * Création d'un nouveau compte utilisateur
 */
export function register(name: string, mail: string, password: string) {
  return api<User>('/api/users', {
    method: 'post',
    params: { origin: location.origin },
    data: { name, mail, password },
    success: (data) => `Bienvenu ${data.name}`,
  })
}

/**
 * Réinitialisation du mot de passe
 */
export function recover(mail: string) {
  return api('/api/users/me/resetpwd', {
    method: 'post',
    data: { mail },
    info: 'Votre nouveau mot de passe vous à été envoyé par mail',
    format: () => null,
  })
}

/**
 * Mise à jour des infos utilisateur
 */
export function update(newValue: Partial<User>) {
  return api<User>('/api/users/me', {
    method: 'patch',
    data: newValue,
    success: 'Profil mis à jour',
  })
}

/**
 * Evoyer un mail de vaildation
 */
export function sendValidationMail() {
  return api('/api/users/me/validmail', {
    method: 'post',
    params: { origin: location.origin },
    success: 'Un mail de validation vous à été envoyé',
  })
}

/**
 * Validation du mail
 */
export function validMail(validator: string) {
  return api(`/api/users/me/validmail/${validator}`, {
    success: 'Votre mail est vaildé',
    format: () => ({ mailvalided: true }),
  })
}

export function changePassword(oldPassword: string, newPassword: string) {
  return api('/api/users/me/changepwd', {
    method: 'post',
    data: { oldPassword, newPassword },
    success: 'Changement du mot de passe réussi',
    error: 'Le changement du mot de passe à échoué',
  })
}

export function search({
  pageParam,
  queryKey,
}: {
  pageParam: number
  queryKey: [string, string]
}) {
  const searchValue = queryKey[1]
  return api<User[]>('/api/users/search', {
    params: { q: searchValue, skip: pageParam },
  })
}

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
  search,
}
