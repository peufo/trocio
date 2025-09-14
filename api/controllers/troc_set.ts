import type { RequestHandler } from "express";
import Troc from "../models/troc.js";
import User from "../models/user.js";
import Subscribe from "../models/subscribe.js";
import { getOpt } from "./option.js";

export const createTroc: RequestHandler = async (req, res, next) => {
  if (!req.session.user) return next(Error("Login required"));
  try {
    /** Create Troc from req.body */
    const troc = new Troc(req.body);
    troc.creator = req.session.user._id;
    troc.tarif = [
      {
        name: "Standard",
        bydefault: true,
        margin: 0,
        fee: [{ price: 0, value: 0 }],
        maxarticles: 100,
        apply: [],
      },
    ];

    /** Check and consume user credit */
    const user = await User.findOne({ _id: req.session.user._id }).exec();
    if (!user) return next(Error("User not found !"));

    if (!troc.is_try) {
      if (user.creditTroc <= -getOpt("FREE_TROC"))
        return next(Error("No credit"));
      user.creditTroc--;
    }

    /** Set default socitey value from user creator */
    if (!troc.society) troc.society = user.name;
    if (!troc.societyMail) troc.societyMail = user.mail;

    /** Save user an new troc */
    await Promise.all([troc.save(), user.save()]);

    /** Create subscribe */
    const subscribe = new Subscribe({
      userId: req.session.user._id,
      trocId: troc._id,
      role: "admin",
      validedByUser: true,
      validedByTroc: true,
      tarifId: troc.tarif[0]._id,
    });

    await subscribe.save();

    return res.json(troc);
  } catch (error) {
    return next(error);
  }
};

// TODO: n'utlisé le patch que pour les infos de base.
// Le reste est fait sur des endpoints plus précis
/** @deprecated */
export function patchTroc(req, res, next) {
  const { trocId } = req.params;

  Troc.findOne({ _id: trocId }).exec((err, troc) => {
    if (err || !troc) return next(err || Error("Not found"));

    console.log(troc.schedule);

    //Verifie si l'horaire est modifier
    if (
      req.body.schedule &&
      JSON.stringify(req.body.schedule) !== JSON.stringify(troc.schedule)
    ) {
      // TODO:remplacer par un avertissement coté client
      // if (new Date(troc.schedule[0]?.open).getTime() < new Date().getTime())
      //  return next(Error(`You cannot edit shedule of troc after he's started`))
      // err = scheduleValidation(req.body)
      // if (err) return next(err)
    }

    if (req.body._id) delete req.body._id;
    if (req.body.__v) delete req.body.__v;
    for (const p in req.body) {
      troc[p] = req.body[p];
    }
    troc.save((err) => {
      if (err) return next(err);
      res.json(troc);
    });
  });
}

/** @deprecated */
export function addAdmin(req, res, next) {
  const { trocId, userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error("User not found"));

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error("Troc not found"));

      // Check if user is already admin
      if (troc.admin.includes(userId))
        return next(Error("User is already admin"));

      // Removed of cashiers
      const cashierIndex = troc.cashier.indexOf(userId);
      if (cashierIndex !== -1) troc.cashier.splice(cashierIndex, 1);

      // Add Admin
      troc.admin.push(userId);

      troc.save(next);
    });
  });
}

/** @deprecated */
export function addCashier(req, res, next) {
  const { trocId, userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error("User not found"));

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error("Troc not found"));

      //Check if user is already cashier
      if (troc.cashier.includes(userId))
        return next(Error("User is already cashier"));

      //Removed of administrators
      const adminIndex = troc.admin.indexOf(userId);
      if (adminIndex !== -1) {
        if (req.session.user._id == userId)
          return next(Error(`You can't become a cashier`));
        if (troc.creator == userId)
          return next(Error(`The creator can't become a cashier`));
        troc.admin.splice(adminIndex, 1);
      }

      troc.cashier.push(userId);
      troc.save(next);
    });
  });
}

/** @deprecated */
export function addTrader(req, res, next) {
  const { trocId, userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error("User not found"));

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error("Troc not found"));

      if (!troc.trader) troc.trader = [];
      troc.trader.push({
        user: userId,
        prefix: req.body.prefix || findNewPrefix(troc.trader),
      });
      troc.save(next);
    });
  });

  function findNewPrefix(traders) {
    let prefixs = traders.map((t) => t.prefix);
    let char = "";
    for (let i = 65; i < 91; i++) {
      char = String.fromCharCode(i);
      if (prefixs.indexOf(char) == -1) break;
    }
    return char;
  }
}

/** @deprecated */
export function removeAdmin(req, res, next) {
  const { trocId, userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error("User not found"));

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error("Troc not found"));

      const adminIndex = troc.admin.indexOf(userId);
      if (adminIndex == -1) return next(Error(`Admin ${userId} not found`));

      if (troc.creator == userId)
        return next(Error(`Can't remove the creator`));
      if (req.session.user._id == userId)
        return next(Error(`Can't remove yourself`));

      troc.admin.splice(adminIndex, 1);

      troc.save(next);
    });
  });
}

/** @deprecated */
export function removeCashier(req, res, next) {
  const { trocId, userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error("User not found"));

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error("Troc not found"));

      const cashierIndex = troc.cashier.indexOf(userId);
      if (cashierIndex == -1) return next(Error(`Cashier ${userId} not found`));

      troc.cashier.splice(cashierIndex, 1);

      troc.save(next);
    });
  });
}

/** @deprecated */
export function removeTrader(req, res, next) {
  const { trocId, userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error("User not found"));

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error("Troc not found"));

      const traderIndex = troc.trader.map((c) => c.user).indexOf(userId);
      if (traderIndex == -1) return next(Error(`Trader ${userId} not found`));

      troc.trader.splice(traderIndex, 1);

      troc.save(next);
    });
  });
}

/** @deprecated */
export function editTraderPrefix(req, res, next) {
  const { trocId, userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error("User not found"));

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error("Troc not found"));

      if (troc.trader.map((t) => t.prefix).indexOf(req.body.prefix) != -1)
        return next(Error(`Prefix ${req.body.prefix} is already used`));

      const traderIndex = troc.trader.map((c) => c.user).indexOf(userId);
      if (traderIndex == -1) return next(Error(`Trader ${userId} not found`));

      troc.trader[traderIndex].prefix = req.body.prefix;

      troc.save(next);
    });
  });
}

export const createTarif: RequestHandler = async (req, res, next) => {
  try {
    const { trocId = "", ...newTarif } = req.body;
    console.log({ newTarif });
    const troc = await Troc.findById(trocId);
    if (!troc) throw "Troc not found";
    troc.tarif.push(newTarif);
    await troc.save();
    res.json(troc);
  } catch (error) {
    next(error);
  }
};

export const deleteTarif: RequestHandler = async (req, res, next) => {
  try {
    const { trocId = "", tarifId = "" } = req.body;
    if (!trocId || !tarifId) throw "trocId and tarifId is required in the body";

    const troc = await Troc.findById(trocId).exec();
    if (!troc) throw "Troc not found";

    const tarifDefault = troc.tarif.find((t) => t.bydefault);
    if (!tarifDefault) throw "Tarif by default not found";
    if (tarifDefault._id.toString() === tarifId)
      throw `Tarif by default can't be removed`;

    // Attribute default tarif for all subscribes with deleted tarif
    const subscribes = await Subscribe.find({ tarifId });
    await Promise.all(
      subscribes.map((sub) => {
        sub.tarifId = tarifDefault._id;
        return sub.save();
      })
    );

    // Update troc.tarif
    troc.tarif = troc.tarif.filter((t) => String(t._id) !== tarifId);
    await troc.save();

    res.json(troc);
  } catch (error) {
    next(error);
  }
};

export const editTarif: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, tarifId, name, margin, maxarticles, fee } = req.body;
    const troc = await Troc.findById(trocId).exec();
    if (!troc) throw "Troc not found";
    const tarifIndex = troc.tarif.findIndex((t) => String(t._id) === tarifId);
    if (tarifIndex < 0) throw "Tarif not found";
    const tarif = troc.tarif[tarifIndex];
    tarif.name = name;
    tarif.margin = margin;
    tarif.maxarticles = maxarticles;
    tarif.fee = fee;
    troc.tarif[tarifIndex] = tarif;
    await troc.save();
    res.json(troc);
  } catch (error) {
    next(error);
  }
};

export const addApply: RequestHandler = (req, res, next) => {
  const { trocId, tarifId, userId } = req.params;
  Troc.findById(trocId, (err, troc) => {
    if (err || !troc) return next(err || Error("Troc not found"));
    // Supprime les autres attribution
    troc.tarif.forEach((tarif) => {
      tarif.apply.pull(userId);
    });
    troc.tarif.id(tarifId).apply.push(userId);
    troc.save(next);
  });
};

export const removeApply: RequestHandler = (req, res, next) => {
  const { trocId, tarifId, userId } = req.params;
  Troc.findById(trocId, (err, troc) => {
    if (err || !troc) return next(err || Error("Troc not found"));
    troc.tarif.id(tarifId).apply.pull(userId);
    troc.save(next);
  });
};
