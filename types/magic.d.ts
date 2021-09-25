import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

/** Option of menu */
export interface EnumOption {
  /** Valeur envoyé par la requête */
  queryValue: string | number
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
  visible: boolean
  /**
   * Formate la valeur afficher. 'string' par défaut
   * Adapte le menu de l'entête
   */
  format: 'string' | 'enum' | 'currency' | 'date'
  /**
   * Clé utilisé pour le query de l'url.
   * Est utilisé pour obtenir la valeur si getValue n'est pas défini
   */
  queryKey: string
  /** Clé ou fonction retournant la valeur à afficher */
  getValue?: (value: Type) => string | number | undefined
  /** Largeur de la colonne */
  cellWidth?: number
  /** Possibilité de caché le champs désactivé */
  disabled?: boolean

  /** Options pour le format "enum" */
  enumOptions?: EnumOption[]
}
