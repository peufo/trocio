let mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const Troc = require('./troc')

let subscribeModel = new Schema({
    user: {type: ObjectId, ref: 'user'},
    troc: {type: ObjectId, ref: 'troc'}
})

subscribeModel.set('timestamps', true)

module.exports = mongoose.model('subscribe', subscribeModel)
