let Troc = require('../models/troc')
let { findTarif } = require('./troc_utils')

function getTarif(req, res, next) {
    let {troc, user} = req.query
    findTarif(troc, user, (err, tarif) => {
        if (err) return next(err)
        res.json(tarif)
    })
}

function getTrader(req, res, next) {
    let {troc, user} = req.query
    if (!troc) return next(Error('troc query is required'))

    //if (req.session.user != req.param.userId) //TODO: Check if req.session.user is cashier
    Troc.findById(troc, {trader: 1}, (err, troc) => {
        if(err || !troc) return next(err || Error('Troc not found !'))
        let index = troc.trader.map(t => t.user).indexOf(user)	
        if (index === -1) {
            res.json({error: true, message: `User isn't a trader`})
        }else{
            res.json({success: true, message: 'User is a trader', prefix: troc.trader[index].prefix})
        }
    })
}

module.exports = {
    getTarif,
    getTrader
}
