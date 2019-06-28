var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

var articleModel = new Schema({
	troc: {type: ObjectId, ref: 'troc', required: true},
	provider: {type: ObjectId, ref: 'user', required: true},
	buyer: {type: ObjectId, ref: 'user'},
	name: {type: String, required: true},
	price: {type: Number, required: true},
	fee: {type: Number, required: true},
	margin: {type: Number, required: true},
	valided: Date, //ou
	deleted: Date,
	sold: Date, //ou
	recover: Date
})

articleModel.set('timestamps', true)

module.exports = mongoose.model('article', articleModel);