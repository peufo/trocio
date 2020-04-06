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
	giveback: [{sold: Date, back: Date, raison: String, user: {type: ObjectId, ref: 'user'}}], //user is not required for anonyme buyer
	validator: {type: ObjectId, ref: 'user'}, //For valided or refused
	seller: {type: ObjectId, ref: 'user'} //For sold or recover
})

articleModel.set('timestamps', true)
/*
articleModel.virtual('statut').get(function() {
	let statut = 'Proposé'
	if (this.valided) statut = 'Validé'
	if (this.sold) statut = 'Vendu'
	if (this.recover) statut = 'Récupéré'
	return statut
})
*/

module.exports = mongoose.model('article', articleModel);