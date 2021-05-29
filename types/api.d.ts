export declare interface BaseResponse {
  error?: boolean
  success?: boolean
  message?: string
}

export declare interface ResponseNotifyOptions<Type> {
  /** Notify success message on success (from serveur if true) */
  success?: string | boolean | ((data: Type) => string)
  /** Notify info message on success (from serveur if true) */
  info?: string | boolean | ((data: Type) => string)
  /** Notify error message on error (from serveur if true) */
  error?: string | boolean | ((error: any) => string)
}
