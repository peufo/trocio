import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export interface SelectOption {
  /** Valeur envoyé par la requête */
  queryValue: string
  /** Label visible de l'élément */
  label: string
  /** Icon de l'élément */
  icon?: IconDefinition
  /** Style appliqué sur l'icon */
  iconStyle?: string
}

export interface FieldInteface<Type = any> {
  /** Text visible dans l'entête */
  label: string
  /** Champs visible */
  checked: boolean
  /** Type de menu de l'entête */
  typeMenu: 'search' | 'select' | 'sort' | 'user'
  /** Clé ou fonction retournant la valeur à afficher */
  getValue: string | ((value: Type) => string | number | undefined)
  /**
   * Clé utilisé pour le query de l'url.
   * Si non défini, l'url n'est ni écouté, ni mis à jour.
   */
  queryKey?: string
  /** Formate la valeur afficher. 'string' par défaut */
  format?: 'string' | 'currency' | 'date' | ((value: Type) => string)
  /** Largeur de la colonne */
  cellWidth?: number
  /** Possibilité de caché le champs désactivé */
  disabled?: boolean

  /** Options pour le type de menu "select" */
  selectOptions?: SelectOption[]
}
