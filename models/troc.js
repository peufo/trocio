var mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	admin: [{type: Schema.Types.ObjectId, ref: 'user'}],
	cashier: [{type: Schema.Types.ObjectId, ref: 'user'}],
	articles: [{type: Schema.Types.ObjectId, ref: 'article'}],
	config: {
		cashiercan: [{
			sale: Boolean,
			return: Boolean,
			payement: Boolean,
			create: Boolean,
			modify: Boolean
		}]
		//marge, regle, etc
	}
})

trocModel.set('timestamps', true)

module.exports = mongoose.model('troc', trocModel);