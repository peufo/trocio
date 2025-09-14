import mongoose, { Schema, Document } from "mongoose";
const { ObjectId } = Schema.Types;

import type { ISubscribe } from "../../src/lib/types/index.js";

let subscribeModel = new Schema({
  trocId: { type: ObjectId, ref: "troc", required: true },
  userId: { type: ObjectId, ref: "user" },

  /** Nécéssaire pour les client anonyme */
  name: { type: String, required: isAnonym },
  /** Clé de récuperation du subscribe anonyme */
  recoverKey: { type: String, required: isAnonym },

  /** Rôle de l'utilsateur sur le troc */
  role: {
    type: String,
    enum: ["basic", "trader", "cashier", "admin"],
    default: "basic",
  },

  /** L'inscription à été faite ou validé par le participant */
  validedByUser: { type: Boolean, default: false },

  /** L'inscription à été faite ou validé par un organisateur du troc */
  validedByTroc: { type: Boolean, default: false },

  /** Réference vers le tarif qui est attribué au participant */
  tarifId: { type: ObjectId, ref: "troc.tarif", required: true },

  /** Prefix pour les traders  */
  prefix: { type: String, uppercase: true, required: isRoleTrader },

  /** @deprecated please use trocId */
  troc: { type: ObjectId, ref: "troc" },
  /** @deprecated please, use userId*/
  user: { type: ObjectId, ref: "user" },
});

// incompatible avec les subscribe sans user, dommage
// subscribeModel.index({ trocId: 1, userId: 1 }, { unique: true })

subscribeModel.set("timestamps", true);

function isRoleTrader() {
  return this.role === "trader";
}

function isAnonym() {
  return !this.userId;
}

export default mongoose.model<ISubscribe & Document>(
  "subscribe",
  subscribeModel
);
