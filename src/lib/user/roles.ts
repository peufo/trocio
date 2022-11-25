import {
  faUserAlt,
  faUserCog,
  faUserTag,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import type { EnumOption, RoleEnum } from 'types'

export const ROLES: EnumOption<RoleEnum>[] = [
  { value: 'basic', label: 'Particulier', icon: faUserAlt },
  { value: 'trader', label: 'Commerçant', icon: faUserTie },
  { value: 'cashier', label: 'Caissier', icon: faUserTag },
  { value: 'admin', label: 'Administrateur', icon: faUserCog },
]
