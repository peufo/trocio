var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var trocModel = new Schema({
	name: {type: String, required: true},
	address: String,
	close: Date,
	admin: [{type: Schema.Types.ObjectId, ref: 'user'}],
	cashier: [{type: Schema.Types.ObjectId, ref: 'user'}],
	art: [{type: Schema.Types.ObjectId, ref: 'article'}]
})

trocModel.set('timestamps', true)

module.exports = mongoose.model('troc', trocModel);