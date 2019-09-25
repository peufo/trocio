var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId

var trocModel = new Schema({
	name: {type: String, required: true},
	society: String,
	societyweb: String,
	address: {type: String, required: true},
	location: {
		lat: {type: Number, required: true},
		lng: {type: Number, required: true}
	},
	description: {type: String, required: true},
	image: {type: String},
	creator: {type: ObjectId, ref: 'user', required: true},
	admin: [{type: ObjectId, ref: 'user'}],
	cashier: [{type: ObjectId, ref: 'user'}],
	provider: [{type: ObjectId, ref: 'user'}],
	schedule: [{open: Date, close: Date}],
	tarif: [{	
		name: String,
		bydefault: Boolean,
		apply: [{type: ObjectId, ref: 'user'}], //Non nécéssaire pour le standard
		margin: Number,
		fee: [{
			price: Number,
			value: Number
		}]
	}],
	articlelastref: {type: Number, required: true, default: 0},

})

trocModel.set('timestamps', true)

module.exports = mongoose.model('troc', trocModel);