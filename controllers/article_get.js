var Article = require('../models/article')
const ObjectId 	= require('mongoose').Types.ObjectId

function searchArticle(req, res, next) {
	let { troc, limit, skip, filter_statut, provider, providernot } = req.query

	let match = {}
	let sort = {}
	
    //addMatch
    match.$or = []
    match.$and = [{name : {$ne: ""}}] //not article without name
    if (troc) match.$and.push({troc: ObjectId(troc)})

    //Filtre pour un groupe de founisseur
	if (provider) match.$and.push({'provider': {$in: provider}})
    if (providernot) match.$and.push({'provider': {$ne: providernot}})

    //Define skip
	skip = Number(skip)
	if (!skip) skip = 0
	
	//Define limit
	limit = Number(limit)
	if (!limit) limit = 40
    else if(limit > 100) limit = 100
    
    //Add filter statut
	switch (filter_statut) {
		case 'proposed':
			match.$and.push({'valided': {$exists: false}})
			match.$and.push({'refused': {$exists: false}})
            break
        case 'proposed':
			match.$and.push({'valided': {$exists: false}})
			match.$and.push({'refused': {$exists: false}})
			break
		case 'valided':
			match.$and.push({'valided': {$exists: true}})
			match.$and.push({'sold': {$exists: false}})
			match.$and.push({'recover': {$exists: false}})
			break
		case 'sold':
			match.$and.push({'sold': {$exists: true}})
			break	
		case 'recover':		
			match.$and.push({'recover': {$exists: true}})
			break
	}
    
	for (key in req.query) {
        
        //add matchSearch
		if (key.indexOf('search_') === 0) {
            match.$and.push({[key.replace('search_', '')]: new RegExp(req.query[key], 'i')})
            
        //add matchOrSearch
        }else if (key.indexOf('or_search_') === 0) {
            match.$or.push({[key.replace('or_search_', '')]: new RegExp(req.query[key], 'i')})
        
        //add matchUser
        }else if (key.indexOf('user_') === 0){
            match.$and.push({[key.replace('user_', '')]: req.query[key]})

        //add sort
        }else if (key.indexOf('sort_') != -1 && !isNaN(req.query[key])) {
			sort[key.replace('sort_', '')] = Number(req.query[key])
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
	searchArticle
}