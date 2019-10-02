var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

var articleModel = new Schema({
	troc: {type: ObjectId, ref: 'troc', required: true},
	provider: {type: ObjectId, ref: 'user', required: true},
	ref: {type: String},
	buyer: {type: ObjectId, ref: 'user'},
	name: {type: String, default: ''},
	price: {type: Number, default: 0},
	fee: {type: Number, default: 0},
	margin: {type: Number, default: 0},
	valided: Date, //ou
	refused: Date,
	sold: Date, //ou
	recover: Date,
	giveback: [{sold: Date, back: Date, raison: String, user: {type: ObjectId, ref: 'user', required: true}}]
})

articleModel.set('timestamps', true)

module.exports = mongoose.model('article', articleModel);