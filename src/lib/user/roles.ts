import {
  faUserAlt,
  faUserCog,
  faUserTag,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import type { EnumOption, RoleEnum } from 'types'

export const ROLES: EnumOption<RoleEnum>[] = [
  { queryValue: 'basic', label: 'Participant', icon: faUserAlt },
  { queryValue: 'trader', label: 'Commerçant', icon: faUserTie },
  { queryValue: 'cashier', label: 'Caissier', icon: faUserTag },
  { queryValue: 'admin', label: 'Administrateur', icon: faUserCog },
]
