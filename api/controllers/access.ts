import type { RequestHandler, Request, Response } from "express";
import createError from "http-errors";

import config from "../../config.js";
import Subscribe from "../models/subscribe.js";

const { TROCIO_ROOT_USER } = config;

export async function getRole(
  trocId: string | undefined,
  userId?: string | undefined
) {
  if (!trocId || !userId) return null;
  const subscribe = await Subscribe.findOne({
    trocId,
    userId,
  });
  return subscribe?.role || null;
}

interface SubscribeQuery {
  subscribeId: string;
  trocId: string;
  userId: string;
}

export function isRootUser(req: Request): boolean {
  if (!req.session.user) return false;
  if (!TROCIO_ROOT_USER) return false;
  return TROCIO_ROOT_USER === req.session.user.mail;
}

export const ensureIsRootUser: RequestHandler = (req, res, next) => {
  if (!req.session.user) return next(createError(401));
  if (!TROCIO_ROOT_USER)
    return next(
      Error("The environment variable TROCIO_ROOT_USER is undefined")
    );
  if (TROCIO_ROOT_USER !== req.session.user.mail)
    return next(Error("Access denied"));
  next();
};

export const ensureUserIsAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (isRootUser(req)) return next();
    const { accessor } = await getAccessedAndAssecor(req, res);
    if (accessor.role !== "admin") throw `User is not admin of troc`;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const ensureUserIsCashier: RequestHandler = async (req, res, next) => {
  try {
    if (isRootUser(req)) return next();
    const { accessor } = await getAccessedAndAssecor(req, res);
    if (accessor.role !== "admin" && accessor.role !== "cashier")
      throw `User is not admin or cashier of troc`;

    return next();
  } catch (error) {
    return next(error);
  }
};

export const ensureUserCanAccessResum: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { accessed, accessor } = await getAccessedAndAssecor(req, res);
    if (isRootUser(req)) return next();
    if (
      accessed._id !== accessor._id &&
      accessor.role !== "admin" &&
      accessor.role !== "cashier"
    ) {
      throw `User can't access to resum`;
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Récupère et le subscribe accédé et accédant
 * set res.locals
 */
async function getAccessedAndAssecor(req: Request, res: Response) {
  try {
    if (!req.session.user?._id) throw "Login required";
    const { subscribeId, trocId } = parseRequest(req);

    if (!subscribeId && !trocId)
      throw "subscribeId or trocId is required in query";

    const accessed = subscribeId
      ? await Subscribe.findById(subscribeId)
      : await Subscribe.findOne({ trocId, userId: req.session.user._id });
    if (!accessed) throw "Subscriber accesed not found";

    // accessor can eventualy be the accessed
    const accessor =
      String(accessed.userId) === String(req.session.user._id)
        ? accessed
        : await Subscribe.findOne({
            trocId: accessed.trocId,
            userId: req.session.user._id,
          });
    if (!accessor) throw "Accessor subscriber not found";

    res.locals.accessed = accessed;
    res.locals.accessor = accessor;

    return { accessed, accessor };
  } catch (error) {
    throw error;
  }
}

/** S'assure également qu'il n'y a pas de diff entre les params */
function parseRequest(req: Request): SubscribeQuery {
  /** Parse subscribeId */
  const subscribeIds = [
    req.params.subscribeId,
    req.body.subscribeId,
    req.query.subscribeId,
    req.query.exact_subscribeId,
  ];
  const subscribeIdsUnique = subscribeIds.filter(Boolean).filter(beUnique);
  if (subscribeIdsUnique.length > 1)
    throw Error("Different subscribeId param is detected");
  const subscribeId = subscribeIdsUnique[0];

  /** Parse trocId */
  const trocIds = [
    req.params.trocId,
    req.body.trocId,
    req.query.trocId,
    req.query.exact_trocId,
  ];
  const trocIdsUnique = trocIds.filter(Boolean).filter(beUnique);
  if (trocIdsUnique.length > 1)
    throw Error("Different trocId param is detected");
  const trocId = trocIdsUnique[0];

  /** Parse userId */
  const userIds = [
    req.params.userId,
    req.body.userId,
    req.query.userId,
    req.query.exact_userId,
  ];
  const userIdsUnique = userIds.filter(Boolean).filter(beUnique);
  if (userIdsUnique.length > 1)
    throw Error("Different userId param is detected");
  const userId = userIdsUnique[0];

  return { trocId, userId, subscribeId };
}

function beUnique(elem: any, index: number, self: any[]) {
  return self.indexOf(elem) === index;
}
