let express = require('express')
let router = express.Router()

let {
  getSpec,
  getResum,
  getStats,
  search,
  getTroc,
} = require('../controllers/troc_get')
let {
  createTroc,
  patchTroc,
  addAdmin,
  addCashier,
  addTrader,
  removeAdmin,
  removeCashier,
  removeTrader,
  editTraderPrefix,
} = require('../controllers/troc_set')
let { checkAdmin } = require('../controllers/troc_utils')

router
  .get('/resum', getResum)
  .get('/spec', getSpec)
  .get('/search', search)
  .get('/:id/stats', checkAdmin, getStats)
  .get('/:id', getTroc)
  .post('/', createTroc)
  .patch('/:id', checkAdmin, patchTroc)
  .post('/:id/admin', checkAdmin, addAdmin)
  .post('/:id/cashier', checkAdmin, addCashier)
  .post('/:id/trader', checkAdmin, addTrader)
  .post('/:id/admin/remove', checkAdmin, removeAdmin)
  .post('/:id/cashier/remove', checkAdmin, removeCashier)
  .post('/:id/trader/remove', checkAdmin, removeTrader)
  .post('/:id/trader/prefix', checkAdmin, editTraderPrefix)

module.exports = router
