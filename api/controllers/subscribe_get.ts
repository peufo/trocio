import Subscribe from '../models/subscribe'
import Troc from '../models/troc'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

export function getMySubscribedTrocs(req, res, next) {
  let { skip = 0, limit = 10 } = req.query
  skip = Number(skip)
  limit = Number(limit)

  if (!req.session.user)
    return res.json({ error: true, message: 'Login required' })
  Subscribe.find({ user: req.session.user._id })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(
      'troc',
      'name description address location admin cashier schedule society societyweb is_try subscriber'
    )
    .lean()
    .exec(async (err, subs) => {
      if (err) return next(err)

      //Admin and cashier becomes booleans
      let trocs = subs
        .map((sub) => {
          let { troc } = sub
          if (!troc) return null
          troc.isAdmin =
            troc.admin.map((a) => a.toString()).indexOf(req.session.user._id) !=
            -1
          troc.isCashier =
            troc.cashier
              .map((c) => c.toString())
              .indexOf(req.session.user._id) != -1
          if (!troc.isAdmin && !troc.isCashier)
            troc.admin = troc.cashier = undefined
          return troc
        })
        .filter(Boolean)

      res.json(trocs)
    })
}

export async function getSubscriber(req, res, next) {
  let {
    trocId,
    skip = 0,
    limit = 10,
    q = '',
    lookupTarif = false,
    filtredTarifs = [],
    exact_tarifId = '',
    computeResum = false,
  } = req.query
  const regexp = new RegExp(q, 'i')
  skip = Number(skip)
  limit = Number(limit)
  try {
    if (!trocId) return next(Error('Query "trocId" is required'))

    const tarifMatch = exact_tarifId
      ? ObjectId(exact_tarifId)
      : { $nin: filtredTarifs.map(ObjectId) }

    const aggregate = Subscribe.aggregate()
      .match({
        troc: new ObjectId(trocId),
        tarifId: tarifMatch,
      })
      .lookup({
        from: 'users',
        let: { userId: '$user' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$userId'],
              },
            },
          },
          {
            $project: {
              name: 1,
              mail: 1,
            },
          },
        ],
        as: 'user',
      })
      .addFields({
        user: { $arrayElemAt: ['$user', 0] },
      })
      .match({ $or: [{ 'user.name': regexp }, { 'user.name': regexp }] })

    if (lookupTarif) {
      aggregate
        .lookup({
          from: 'trocs',
          let: { tarifId: '$tarifId' },
          pipeline: [
            {
              $unwind: {
                path: '$tarif',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$$tarifId', '$tarif._id'],
                },
              },
            },
            {
              $replaceRoot: {
                newRoot: '$tarif',
              },
            },
          ],
          as: 'tarif',
        })
        .addFields({
          tarif: { $arrayElemAt: ['$tarif', 0] },
        })
    }

    if (computeResum) {
      let letTrocAndUser = { trocId: '$troc', userId: '$user._id' }
      let matchWith = (userField: 'user' | 'provider' | 'buyer') => ({
        $match: {
          $expr: {
            $and: [
              { $eq: ['$troc', '$$trocId'] },
              { $eq: [`$${userField}`, '$$userId'] },
            ],
          },
        },
      })

      aggregate
        .lookup({
          from: 'articles',
          let: letTrocAndUser,
          pipeline: [
            matchWith('provider'),
            {
              $group: {
                _id: null,
                providedCount: { $sum: 1 },
                providedSum: { $sum: '$price' },
                feeSum: {
                  $sum: {
                    $cond: [{ $not: ['$valided'] }, 0, '$fee'],
                  },
                },
                soldSum: {
                  $sum: {
                    $cond: [{ $not: ['$sold'] }, 0, '$price'],
                  },
                },
                soldCount: {
                  $sum: {
                    $cond: [{ $not: ['$sold'] }, 0, 1],
                  },
                },
                marginSum: {
                  $sum: {
                    $cond: [{ $not: ['$sold'] }, 0, '$margin'],
                  },
                },
              },
            },
          ],
          as: 'providedResum',
        })
        .lookup({
          from: 'articles',
          let: letTrocAndUser,
          pipeline: [
            matchWith('buyer'),
            {
              $group: {
                _id: null,
                purchasesCount: { $sum: 1 },
                purchasesSum: { $sum: '$price' },
              },
            },
          ],
          as: 'purchasesResum',
        })
        .lookup({
          from: 'payments',
          let: letTrocAndUser,
          pipeline: [
            matchWith('user'),
            {
              $group: {
                _id: null,
                paymentsCount: { $sum: 1 },
                paymentsSum: { $sum: '$amount' },
              },
            },
          ],
          as: 'paymentsResum',
        })
        .addFields({
          resum: {
            $mergeObjects: [
              { $arrayElemAt: ['$providedResum', 0] },
              { $arrayElemAt: ['$purchasesResum', 0] },
              { $arrayElemAt: ['$paymentsResum', 0] },
            ],
          },
        })
        .addFields({
          'resum.balance': {
            $subtract: [
              {
                $sum: ['$resum.paymentsSum', '$resum.soldSum'],
              },
              {
                $sum: [
                  '$resum.feeSum',
                  '$resum.marginSum',
                  '$resum.purchasesSum',
                ],
              },
            ],
          },
        })
        .project({
          providedResum: 0,
          purchasesResum: 0,
          paymentsResum: 0,
        })
    }

    aggregate
      .skip(skip)
      .limit(limit)
      .exec(async (err, subscribes) => {
        if (err) return next(err)
        res.json(subscribes)
      })
  } catch (error) {
    next(error)
  }
}

export default { getMySubscribedTrocs, getSubscriber }
