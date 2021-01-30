var mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

let articleModel = new Schema({
	troc: {type: ObjectId, ref: 'troc', required: true},
	provider: {type: ObjectId, ref: 'user', required: true},
	ref: {type: String, required: true},
	name: {type: String, default: ''},
	price: {type: Number, default: 0},
	fee: {type: Number, default: 0},
	margin: {type: Number, default: 0},
	valided: Date, //ou
	refused: Date,
	sold: Date, //ou
	recover: Date,
	giveback: [{sold: Date, back: Date, raison: String, user: {type: ObjectId, ref: 'user'}}], //user is not required for anonyme buyer
	buyer: {type: ObjectId, ref: 'user'},
	validator: {type: ObjectId, ref: 'user'}, //For valided or refused
	seller: {type: ObjectId, ref: 'user'}, //For sold or recover
	newPriceRequest: {
		applicant: {type: ObjectId, ref: 'user'},
		createdAt: Date,
		price: Number
	}
})

articleModel.set('timestamps', true)

//TODO: Add pre('save price') and compute fee and margin

module.exports = mongoose.model('article', articleModel);