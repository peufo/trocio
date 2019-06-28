var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

var trocModel = new Schema({
	name: {type: String, required: true},
	society: String,
	societyweb: String,
	address: {type: String, required: true},
	town: {type: String, required: true},
	country: {type: String, required: true},
	description: {type: String, required: true},
	open: {type: Date, required: true},
	close: {type: Date, required: true},
	creator: {type: ObjectId, ref: 'user', required: true},
	admin: [{type: ObjectId, ref: 'user'}],
	cashier: [{type: ObjectId, ref: 'user'}],
	articles: [{type: ObjectId, ref: 'article'}],
	config: {
		
		//marge, regle, etc
	},
	payment:[{
		user : {type: ObjectId, ref: 'user'},
		time : Date,
		amount: Number
	}]	
})

trocModel.set('timestamps', true)

module.exports = mongoose.model('troc', trocModel);