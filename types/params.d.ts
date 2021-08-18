export declare interface ParamsAPI {
  trocId: string
  /**  */
  filtredTarifs: string[]
  /** query */
  q: string
}

export declare interface ParamsClient extends ParamsAPI {
  tab_admin: string
  tarif_selected: string
}
