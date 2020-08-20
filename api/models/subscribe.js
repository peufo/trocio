let mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

let subscribeModel = new Schema({
    user: {type: ObjectId, ref: 'user'},
    troc: {type: ObjectId, ref: 'troc'}
})

subscribeModel.set('timestamps', true)

module.exports = mongoose.model('subscribe', subscribeModel)
