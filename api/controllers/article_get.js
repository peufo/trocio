var Article = require('../models/article')
const ObjectId 	= require('mongoose').Types.ObjectId

function getArticle(req, res, next) {
	Article.find({_id: req.params.id}).exec((err, article) => {
		if (err) return next(Error(err))
		res.json(article)
	})
}

function searchArticle(req, res, next) {
	let { troc, limit, skip, filter_statut, provider, providernot, include_without_name } = req.query

	let match = {}
	let sort = {}
	const QUERY_SEARCH = 'search_'
	const QUERY_OR_SEARCH = 'or_search_'
	const QUERY_SORT = 'sort_'
	const QUERY_USER = 'user_'

    //addMatch
	match.$or = []
	if (include_without_name) match.$and = []
    else match.$and = [{name : {$ne: ""}}] //not article without name
    if (troc) match.$and.push({troc: ObjectId(troc)})

    //Filtre pour un groupe de founisseur
	if (provider) match.$and.push({'provider': {$in: provider}})
    if (providernot) match.$and.push({'provider': {$ne: providernot}})

    //Define skip
	skip = Number(skip)
	if (!skip) skip = 0
	
	//Define limit
	//TODO: Créer un échec du calcul du solde chez le client
	limit = Number(limit)
	if (!limit) limit = 40
    else if(limit > 100) limit = 100
    
    //Add filter statut
	switch (filter_statut) {
		case 'proposed':
			match.$and.push({'valided': {$exists: false}})
			match.$and.push({'refused': {$exists: false}})
            break
		case 'valided':
			match.$and.push({'valided': {$exists: true}})
			match.$and.push({'sold': {$exists: false}})
			match.$and.push({'recover': {$exists: false}})
			break
		case 'refused':
			match.$and.push({'refused': {$exists: true}})
			break
		case 'sold':
			match.$and.push({'sold': {$exists: true}})
			break	
		case 'recover':		
			match.$and.push({'recover': {$exists: true}})
			break
	}
	
	
	//Dinamic query
	for (key in req.query) {
        
        //add matchSearch
		if (key.indexOf(QUERY_SEARCH) === 0) {
            match.$and.push({[key.replace(QUERY_SEARCH, '')]: new RegExp(req.query[key], 'i')})
            
        //add matchOrSearch
        }else if (key.indexOf(QUERY_OR_SEARCH) === 0) {
            match.$or.push({[key.replace(QUERY_OR_SEARCH, '')]: new RegExp(req.query[key], 'i')})
        
        //add matchUser
        }else if (key.indexOf(QUERY_USER) === 0){
            match.$and.push({[key.replace(QUERY_USER, '')]: req.query[key]})

        //add sort
        }else if (key.indexOf(QUERY_SORT) != -1 && !isNaN(req.query[key])) {
			sort[key.replace(QUERY_SORT, '')] = Number(req.query[key])
		}

    }
    
    //remove match if is empty
    if (match.$and.length === 0) delete match.$and
    if (match.$or.length === 0) delete match.$or


	Article.find(match).sort(sort).skip(skip).limit(limit)
		.populate('provider', 'name')
		.populate('validator', 'name')
		.populate('seller', 'name')
		.populate('buyer', 'name')
		.exec((err, articles) => {
		if (err) return next(err)

		Article.find(match).countDocuments((err, articlesMatchCount) => {
			if (err) return next(err)
			res.json({data: articles, dataMatchCount: articlesMatchCount})
		})
	})
}



module.exports = {
	getArticle,
	searchArticle
}