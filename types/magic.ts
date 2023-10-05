import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

import type { GenericObject, NestedPaths } from './nestedpath'

/** Option of menu */
export interface Option<TValue = string | number | boolean | null> {
  /** Valeur envoyé par la requête */
  value: TValue
  /** Label visible de l'élément */
  label: string
  /** Icon de l'élément */
  icon?: IconDefinition
  /** Style appliqué sur l'icon */
  iconStyle?: string
}

export interface SelectAsync {
  /** Url de recherche */
  path: string
  /** Parametre de recherche (query) */
  searchKey: string
  /** Paramètres ajouté aux requète de recherche */
  queryParams?: object
  /** Affichage de la propriété principal ('name' par défaut  ) */
  getValue?: (item: any) => string
  /** Affichage d'une propriété secondaire */
  getValue2?: (item: any) => string
  /** Obtien l'identifiant à partir de l'item */
  getKey?: (item: any) => string
}

export interface FieldInteface<Type extends GenericObject = {}> {
  /** Text visible dans l'entête */
  label: string
  /**
   * Clé utilisé pour le query de l'url.
   * Est utilisé pour obtenir la valeur si getValue n'est pas défini
   */
  key: NestedPaths<Type>
  /**
   * Formate la valeur afficher. 'string' par défaut
   * Adapte le menu de l'entête
   */
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'user'
    | 'select'
    | 'selectAsync'
    | 'currency'
    | 'date'
  /** Champs cacher */
  hidden?: boolean
  /** Clé ou fonction retournant la valeur à afficher */
  getValue?: (value: Type) => string | number | undefined
  /** Largeur de la colonne */
  cellWidth?: number
  /** Possibilité de caché le champs désactivé */
  disabled?: boolean

  /** Options pour le format "select" */
  options?: Option[]

  /** Options pour la recherche et la selection d'item */
  selectAsync?: SelectAsync
}
