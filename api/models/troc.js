const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const mongooseLeanVirtuals = require('mongoose-lean-virtuals')
const Subscribe = require('./subscribe')

let trocModel = new Schema({
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
		fontSize: {type: Number, default: 16},
		border: {type: Boolean, default: true}
	},
	is_try: {type: Boolean, default: false},
	subscriber: {type: Number, default: 1},
	articles: {type: Number, default: 0}
}, {
	toJSON: { virtuals: true}
})

trocModel.set('timestamps', true)

trocModel.virtual('isClosed').get(function() {
	return !!this.schedule[0] && this.schedule[this.schedule.length - 1].close.getTime() < new Date().getTime()
})

trocModel.plugin(mongooseLeanVirtuals)

module.exports = mongoose.model('troc', trocModel)