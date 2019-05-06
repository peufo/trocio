var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var trocModel = new Schema({
	name: String,
	address: String,
	open: Date,
	close: Date,
	admin: [{type: Schema.Types.ObjectId, ref: 'user'}],
	cashier: [{
		ref: {type: Schema.Types.ObjectId, ref: 'user'},
		can: {
			sale: Boolean, 
			return: Boolean, 
			payement: Boolean, 
			create: Boolean, 
			modify: Boolean
		}
	}],
	art: [{type: Schema.Types.ObjectId, ref: 'article'}]
})

module.exports = mongoose.model('troc', trocModel);