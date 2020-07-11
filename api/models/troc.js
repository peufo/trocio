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
	trader: [{user : {type: ObjectId, ref: 'user'}, prefix: {type: String, uppercase: true}}],
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
		}],
		maxarticles: {type: Number, default: 100}
	}],
	articlelastref: {type: Number, required: true, default: 0},
	tag: {
		width: {type: Number, default: 90},
		height: {type: Number, default: 29},
		padding: {type: Number, default: 2},
		border: {type: Boolean, default: true}
	}

})

trocModel.set('timestamps', true)

module.exports = mongoose.model('troc', trocModel);