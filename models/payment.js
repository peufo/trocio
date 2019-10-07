var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

var paymentModel = new Schema({
    user: {type: ObjectId, ref: 'user'},
    troc: {required: true, type: ObjectId, ref: 'troc'},
    amount: {required: true, type: Number},
	message: String
})

paymentModel.set('timestamps', true)

module.exports = mongoose.model('payment', paymentModel);