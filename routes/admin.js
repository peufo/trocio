var router 	= require('express').Router()

router
    .get('/', checkSuperAdmin, (req, res, next) => {
        res.json('Hey super admin')
    })

function checkSuperAdmin(req, res, next) {
    if (!req.session.user) return next(Error('Login required'))
    if (!process.env.TROCIO_ADMIN) return next(Error('The environment variable TROCIO_ADMIN is undefined'))
    if (process.env.TROCIO_ADMIN != req.session.user.mail) return next(Error('Access denied'))
    next()
}

module.exports = router