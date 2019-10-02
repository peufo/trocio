var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

var mailvalidatorModel = new Schema({
    user: { type: ObjectId, ref: 'user',required: true },
    url: { type: String, required: true },
    validity: { type: Date,  default: +new Date() + 2*60*60*1000 }
})

module.exports = mongoose.model('mailvalidator', mailvalidatorModel);