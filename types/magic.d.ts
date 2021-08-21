export interface FieldInteface<Type = any> {
  /** Text visible dans l'entête */
  label: string
  /** Champs visible */
  checked: boolean
  /** Type de menu de l'entête */
  typeMenu: 'search' | 'filter' | 'sort' | 'user'
  dataType: 'string' | 'number' | 'date'
  /** Clé ou fonction retournant la valeur à afficher */
  getValue: string | ((value: Type) => string | number | undefined)
  /** Largeur de la colonne */
  cellWidth?: number
  /** Possibilité de caché le champs désactivé */
  disabled?: boolean
}
