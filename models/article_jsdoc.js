/**
 * @typedef {Object} Giveback
 * @property {Date} sold 		Date de la vente qui à été anulé
 * @property {Date} back 		Date de retour de l'article
 * @property {String} raison 	Raison du retour
 * @property {ObjectId} user 	Client ayant effetué le retour
 */

/**
 * @typedef {Object} ArticleModel
 * @property {ObjectId} troc 		ID du troc auquel l'article proposé
 * @property {ObjectId} provider 	ID de l'utilisateur qui propose l'article
 * @property {String} 	ref 		Reference lisible et unique de l'article TODO: rendre unique
 * @property {String} 	name 		Nom ou désignation de l'article
 * @property {Number} 	price 		Prix de l'article
 * @property {Number} 	fee 		Frais prise par l'organisation sur l'article lors de sa validation. Elle est calculé sur le prix en fonction du tarif décidé pour le fournisseur.
 * @property {Number} 	margin 		Marge prise par l'organisation sur l'article lors de sa vente. Elle est calculé sur le prix en fonction du tarif décidé pour le fournisseur.
 * @property {Date} 	valided		Date de validation de l'article par l'organisateur (validator)
 * @property {Date} 	refused		Date du refus de l'article par l'organisateur (validator)
 * @property {Date} 	sold		Date de la vente de l'article (seller) -> (buyer)
 * @property {Date} 	recover		Date de la récupération de l'article par le fournisseur (seller) -> (provider)
 * @property {[Giveback]} 	giveback Listes des retours de l'article (si ils sont autorisés)
 * @property {ObjectId} buyer 		ID du client ayant effectué l'achat
 * @property {ObjectId} validator 	ID du membre de l'organisation ayant validé ou refusé l'article
 * @property {ObjectId} seller 		ID du membre de l'organisation ayant vendu ou rendu l'article
 */
