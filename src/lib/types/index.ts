export * from "./api.js";
export * from "./user.js";
export * from "./troc.js";
export * from "./article.js";
export * from "./subscribe.js";
export * from "./payment.js";
export * from "./params.js";
export * from "./message.js";
export * from "./option.js";
export * from "./payment.js";
export * from "./opencagedata.js";

// Utils
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
