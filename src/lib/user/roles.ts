import {
  faUserAlt,
  faUserCog,
  faUserTag,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import type { EnumOption, RoleEnum } from 'types'

export const ROLES: EnumOption<RoleEnum>[] = [
  { key: 'basic', label: 'Particulier', icon: faUserAlt },
  { key: 'trader', label: 'Commerçant', icon: faUserTie },
  { key: 'cashier', label: 'Caissier', icon: faUserTag },
  { key: 'admin', label: 'Administrateur', icon: faUserCog },
]
