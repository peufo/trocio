import type { RequestHandler } from "express";
import mongoose from "mongoose";

import Payment from "../../models/payment.js";
import Subscribe from "../../models/subscribe.js";
import { populateUser } from "../lookup.js";

const { ObjectId } = mongoose.Types;

export const getPayments: RequestHandler = async (req, res, next) => {
  try {
    const { subscribeId } = req.query;

    if (!req.session.user) throw "Login required !";
    if (typeof subscribeId !== "string") throw "userSubId is required";

    const acceded = await Subscribe.findById(subscribeId);
    if (!acceded) throw "acceded not found";

    const accesor = await Subscribe.findOne({
      userId: req.session.user._id,
      trocId: acceded.trocId,
    });
    if (!accesor) throw "accesor not found";
    if (
      accesor._id.valueOf() !== subscribeId &&
      accesor.role !== "admin" &&
      accesor.role !== "cashier"
    )
      throw "Not allowed";

    const payments = await Payment.aggregate()
      .match({
        userSubId: new ObjectId(subscribeId),
      })
      .lookup(populateUser("acceptor"))
      .lookup(populateUser("user"))
      .addFields({
        acceptor: { $arrayElemAt: ["$acceptor", 0] },
        user: { $arrayElemAt: ["$user", 0] },
      });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};
