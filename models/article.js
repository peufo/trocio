var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var articleModel = new Schema({
	troc: {type: Schema.Types.ObjectId, ref: 'troc'},
	provider: {type: Schema.Types.ObjectId, ref: 'user'},
	buyer: {type: Schema.Types.ObjectId, ref: 'user'},
	name: String,
	ref: Number,
	price: Schema.Types.Decimal128,
	fee: Schema.Types.Decimal128,
	margin: Schema.Types.Decimal128,
	declared: Date,
	valided: Date, //ou
	deleted: Date,
	sold: Date, //ou
	recover: Date
})

module.exports = mongoose.model('article', articleModel);