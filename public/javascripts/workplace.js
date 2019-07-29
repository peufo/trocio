$(function() {

var member = {},
	cart = [],
	payment = {},
	modeModifyMember = false

	//socket.on('notify_error', function(data){Notify(data, true)})
	//socket.on('connect_error', function(err) {Notify('Connection absente !', true)});

	//User
	var users = []

	var trocId = '5c5626a52212051cc404bf1e'

	//$.get('/trocs/:id', data =>  {})

/*
	socket.emit('load_users')
	socket.on('load_users', function(data){
		users = data
		for (var i = users.length - 1; i >= 0; i--) {users[i].historic = []}
		ChargeUsersCards()
		socket.emit('load_users_historic')
	})
*/



/*

	socket.on('load_users_historic', function(data){
		var indexs = data.map(dat => users.map(v => v.id).indexOf(dat.member_id))
		var chrono = new Date()
		for (var i = indexs.length - 1; i >= 0; i--) {//attention double inversion
			users[indexs[i]].historic.push(data[i])
		}
		console.log('load_users_historic temps donnée:', new Date() - chrono)
		for (var i = users.length - 1; i >= 0; i--) {
			ChargeUserHistoric(i)
		}
		console.log('load_users_historic temps total:', new Date() - chrono)
	})
*/


/*
	socket.on('add_users_event', function(data){
		var indexs = data.map(dat => users.map(v => v.id).indexOf(dat.member_id))
		for (var i = indexs.length - 1; i >= 0; i--) {
			users[indexs[i]].historic.push(data[i])
			AddUserHistoric(indexs[i], users[indexs[i]].historic.length-1)	
			MajBalance(indexs[i])		
		}
		for (var i = users.length - 1; i >= 0; i--) {AddUserHistoricEvents(i)}	
	})
*/


/*
	socket.on('maj_users_event', function(data){
		var indexs = data.map(dat => users.map(v => v.id).indexOf(dat.member_id))
		users[indexs[0]].historic = []
		for (var i = indexs.length - 1; i >= 0; i--) {
			users[indexs[i]].historic.push(data[i])// doit passer par une boulce pour inversé l'ordre des évenements
		}
		ChargeUserHistoric(indexs[0])
	})
*/

	function ChargeUserHistoric(i){
		$('#userHistoric' + i).text('')
		
		MajBalance(i)
		users[i].historic.forEach((v, j) => AddUserHistoric(i, j))
		AddUserHistoricEvents(i)

		$('#userHistoric' + i).prepend('<div id="printUser'+ i +'" class="w3-row w3-small w3-opacity w3-center">Imprimer</div>')
		$('#printUser' + i).click(function(){
			//Imprime
			var i = parseInt($(this).attr('id').replace('printUser', ''))
			console.log(window.location.href + '/printMember/' + users[i].id)
			var newWin=window.open(window.location.href + '/printMember/' + users[i].id, 'Print-Window')
			setTimeout(function(){newWin.print()},500)
			setTimeout(function(){newWin.close()},1000)
		})
		$('#printUser' + i).mouseenter(function(){$(this).removeClass('w3-opacity')})
		$('#printUser' + i).mouseleave(function(){$(this).addClass('w3-opacity')})

		$('#userHistoric' + i).append('<div id="recoverUser'+ i +'" class="w3-row w3-small w3-opacity w3-center">Tout récupérer</div>')		
		$('#recoverUser' + i).click(function(){
			//ajoute tous les articles encore diponible dans le panier
			var i = $(this).attr('id').replace('recoverUser', '')
			for (var j = articles.length - 1; j >= 0; j--) {
				if (articles[j].provider_id == users[i].id && articles[j].buyer_id == null) {
					socket.emit('add_reserved_article', articles[j].id)
				}
			}
		})
		$('#recoverUser' + i).mouseenter(function(){$(this).removeClass('w3-opacity')})
		$('#recoverUser' + i).mouseleave(function(){$(this).addClass('w3-opacity')})

	}

	function MajBalance(userIndex){
		users[userIndex].balanceReal = Math.round(users[userIndex].historic.map(v => v.movement).reduce((acc, cur) => acc + cur) * 100) / 100
		if (users[userIndex].balanceReal < 0) {$('#balanceReal' + userIndex).css('background-color', 'red')}
		else{$('#balanceReal' + userIndex).css('background-color', '')}
		$('#balanceReal' + userIndex).text(users[userIndex].balanceReal.toFixed(2))
		$('#balancePotential' + userIndex).text(users[userIndex].historic.map(v => v.movement_bis).reduce((acc, cur) => acc + cur).toFixed(2))
	}

	function AddUserHistoricEvents(i){
		for (var j = users[i].historic.length - 1; j >= 0; j--) {
			$('#user'+ i +'Event' + j).mouseenter(function(){
				$(this).removeClass('w3-opacity')
				var articleIndex = parseInt($(this).attr('data-articleIndex'))
				articleIndex = articles.map(v => v.id).indexOf(articleIndex)
				if(articleIndex > -1){
					if (!onlyAvailableArticle || (onlyAvailableArticle && articles[articleIndex].buyer_id == null)) {
						$('#articles').prepend($('#article' + articleIndex))
						$('#article' + articleIndex).css('display', 'block')
						$('#article' + articleIndex).children('.articleInfoDetail').css('display', 'block')
						$('#article' + articleIndex).addClass('w3-theme-d3')				
					}					
				}
			})

			$('#user'+ i +'Event' + j).mouseleave(function(){
				$(this).addClass('w3-opacity')
				var articleIndex = parseInt($(this).attr('data-articleIndex'))
				articleIndex = articles.map(v => v.id).indexOf(articleIndex)
				if (articleIndex > -1) {
					$('#article' + articleIndex).children('.articleInfoDetail').css('display', 'none')
					$('#article' + articleIndex).removeClass('w3-theme-d3')
				}
			})					
		}

	}

	function AddUserHistoric(userIndex, enventIndex){
		var event = users[userIndex].historic[enventIndex]
		$('#userHistoric' + userIndex).prepend('<div id="user'+ userIndex + 'Event' + enventIndex + '" data-articleIndex="'+ event.article_id +'" class="userEvent w3-row w3-small w3-opacity">'
		+		'<div class="w3-col w3-half">'+ new Date(event.event_time).toLocaleString() + ' -> ' + event.event_type + ' ' + event.article_name + '</div>'
		+		'<div class="w3-col w3-quarter w3-center">'+ event.movement.toFixed(2) + '</div>'
		+		'<div class="w3-col w3-quarter w3-center w3-opacity">'+ event.movement_bis.toFixed(2) + '</div>'
		+	'</div>'
		)
		$('#userHistoric' + userIndex).prepend($('#printUser' + userIndex))		
	}

 	function AddUsersCardsEvents(){
 		$('.userInfo').click(function(){
 			var i = $(this).attr('id').replace('userInfo', '')
 			SelectUserCard(i)
 		})

 		$('.userInfo').dblclick(function(){
 			//Modification du membre
 			modeModifyMember = true
 			var i = $(this).attr('id').replace('userInfo', '')
 			newUser = users[i]
			$('#userNameInput').val(newUser.name)
			$('#userMailInput').val(newUser.mail)
			$('#userPhoneInput').val(newUser.phone)
			$('#userBirthdayInput').val(newUser.birthday.substring(0, 10))
			$('#newUser').addClass('w3-disabled')
			openFormNewUser()
 		})

		$('.userInfo').mouseenter(function(){
			$(this).children('.userInfoDetail').css('display', 'block')
			$(this).addClass('w3-theme-d3')
		})
		$('.userInfo').mouseleave(function(){
			$(this).children('.userInfoDetail').css('display', 'none')
			$(this).removeClass('w3-theme-d3')
			var i = $(this).attr('id').replace('userInfo', '')
			$('#userHistoric' + i).css('display', 'none')
			$('#afficheUserHistoric' + i).css('display', 'block')
		})

		$('.afficheUserHistoric').click(function(){
			var i = $(this).attr('id').replace('afficheUserHistoric', '')
			$('#userHistoric'+ i).css('display', 'block')
			$('#afficheUserHistoric'+ i).css('display', 'none')
		})
		$('.afficheUserHistoric').mouseenter(function(){$(this).removeClass('w3-opacity')})
		$('.afficheUserHistoric').mouseleave(function(){$(this).addClass('w3-opacity')})

		$('.balanceReal').click(function(){
			var i = $(this).attr('id').replace('balanceReal', '')
			if (users[i].balanceReal != 0) {
				payment.amount = -users[i].balanceReal
				payment.member_id = users[i].id
				$('#paymentMember').text(users[i].name)
				if (users[i].balanceReal < 0) {
					$('#paymentDirection').removeClass('fa-arrow-up')
					$('#paymentDirection').addClass('fa-arrow-down')
				}else{
					$('#paymentDirection').removeClass('fa-arrow-down')
					$('#paymentDirection').addClass('fa-arrow-up')
				}
				$('#paymentAmount').text(Math.abs(users[i].balanceReal).toFixed(2))
				$('#paymentForm').css('display', 'block')
				$('#confirmPayment').css('display', 'block')				
			}
		})

		$('.balanceReal').mouseenter(function(){
			$(this).css('border-left', 'solid 2px white')
			$(this).css('border-right', 'solid 2px white')
		})
		$('.balanceReal').mouseleave(function(){
			$(this).css('border-left', 'hidden')
			$(this).css('border-right', 'hidden')
		})
 	}

	function AddUserCard(i){
		searchArrayUser.push({
			label: '',
			index: i,
			ok: true
		})

		$('#users').prepend(
	 		 '<div id="userInfo'+ i +'" class="userInfo w3-card w3-padding w3-theme-d2 w3-round" style="cursor: pointer; display: none;">'  
			+	'<div class="w3-row w3-large">'
			+		'<div id="userNameOut'+ i +'" class="userNameOut w3-col w3-half"></div>'
			+		'<div id="balanceReal'+ i +'" class="balanceReal w3-quarter w3-center w3-large w3-round"></div>'
			+		'<div id="balancePotential'+ i +'" class="w3-quarter w3-center w3-opacity w3-large"></div>'
			//+		users[i].id
			+	'</div>'

			+	'<div class="userInfoDetail w3-row w3-small" style="display: none;">'
			+		'<div class"w3-row">'
			+			'<div class="w3-half">'
			+				'<div id="userMailOut'+ i +'" class="w3-tiny"></div>'
			+				'<div class"w3-row">'
			+					'<div id="userPhoneOut'+ i +'" class="w3-half w3-tiny"></div>'
			+					'<div id="userBirthdayOut'+ i +'" class="w3-half w3-tiny"></div>'
			+				'</div>'
			+			'</div>'
			+			'<div id="afficheUserHistoric'+ i +'" class="afficheUserHistoric w3-half w3-round w3-center w3-padding w3-opacity" style="display: block;">Afficher historique</div>'			
			+		'<div>'
			+		'<div id="userHistoric'+ i +'" class="userHistoric" style="display: none; padding-top: 40px"></div>'	
			+	'</div>'		
			+'</div>'
		)
		MajUserCard(i)
	}

	function MajUserCard(i){
		var myStr = escapeHtml(users[i].name) + ' ' + escapeHtml(users[i].mail) + ' ' + users[i].phone + ' ' + new Date(users[i].birthday).toLocaleDateString()
		searchArrayUser.filter(v => v.index == i)[0].label = myStr.toLowerCase()
		$('#userNameOut' + i).text(escapeHtml(users[i].name))
		$('#userMailOut' + i).html('<i class="fa fa-envelope"></i> ' + escapeHtml(users[i].mail))
		$('#userPhoneOut' + i).html('<i class="fa fa-phone"></i> ' +  users[i].phone)
		$('#userBirthdayOut' + i).html('<i class="fa fa-birthday-cake"></i> ' + new Date(users[i].birthday).toLocaleDateString())
	}

	function ChargeUsersCards(){
		$('#users').text('')
		var length = users.length
		for (var i = 0; i < length; i++) {
			AddUserCard(i)
		}
		AddUsersCardsEvents()
	}

	function SelectUserCard(i){
		member = users[i]
		member.userIndex = i
		$('#provider').text(member.name)
		$('#buyer').text(member.name)
 		$('.userInfo').removeClass('w3-theme-d4')
 		$('#userInfo' + i).addClass('w3-theme-d4')
 		$('#userInfo' + i).css('display', 'block')
 		if (modeModifyArticle && newArticle.provider_id != member.id) {
 			CloseFormNewArticle()
 		}else if(!modeModifyArticle){
 			TestFormArticle()
 		}
 		TestCart()
	}
/*
	$('#confirmPayment').click(function(){
		$('#confirmPayment').css('display', 'none')
		socket.emit('newPayment', payment)
	})

	socket.on('newPaymentOk', function(){
		$('#paymentForm').css('display', 'none')
		if (payment.amount > 0) {
			Notify('Vous avez bien d\'encaissé ' + payment.amount.toFixed(2) + ' <i class="fa fa-credit-card"></i>')
		}else{
			Notify('Vous avez bien remboursé ' + payment.amount.toFixed(2) + ' <i class="fa fa-credit-card"></i>')
		}
	})
*/
	$('#cancelPayment').click(function(){
		$('#paymentForm').css('display', 'none')
	})

	$('#openFormNewUser').mouseenter(function(){$(this).prepend('<i class="fa fa-plus"></i>')})
	$('#openFormNewUser').mouseleave(function(){$(this).children('.fa-plus').remove()})

	$('#openFormNewUser').click(function(){
		openFormNewUser()
	})

	function openFormNewUser(){
		$('#users').css('display', 'none')
		$('#formNewUser').css('display', 'block')
		$('#newUser').css('display', 'block')
		window.setTimeout(function(){$('#userNameInput').focus()}, 100)
	}

	$('#closeFormNewUser').click(function(){
		CloseFormNewUser()
	})

		/*
	var newUser = {},
		newUserOk = false

	$('.userInput').on('keyup click',function(){

		newUser.name = $('#userNameInput').val()
		newUser.mail = $('#userMailInput').val()
		newUser.phone = $('#userPhoneInput').val()
		newUser.birthday = $('#userBirthdayInput').val()

		newUserOk = true
		var birthday = new Date(newUser.birthday)
		if (newUser.name.length < 2) {newUserOk = false}
		if (newUser.mail.length < 4 || newUser.mail.indexOf('@') == -1) {newUserOk = false}
		//if (newUser.phone.length < 7) {newUserOk = false}
		if (isNaN(birthday.getTime())) {newUserOk = false}
		if (birthday.getFullYear() < 1900 || birthday.getFullYear() > new Date().getFullYear() - 5) {newUserOk = false}

		if (newUserOk) {
			$('#newUser').removeClass('w3-disabled')
		}else{
			$('#newUser').addClass('w3-disabled')
		}
	})

	$('#userBirthdayInput').keyup(function(){
		if (event.which == 13) {SendFormMember()} 
	})

	$('#newUser').on('click', function(){
		SendFormMember()
	})

	function SendFormMember(){
		if(newUserOk){
			if (modeModifyMember) {
				socket.emit('modify_user', newUser)
			}else{
				socket.emit('new_user', newUser)			
			}
			$('#newUser').css('display', 'none')
		}		
	}

	*/

/*
	socket.on('new_user_ok', function(data){
		CloseFormNewUser()
		data.historic = GetInscritpion(data.id)
		users.push(data)
		AddUserCard(users.length - 1)
		AddUsersCardsEvents()
		ChargeUserHistoric(users.length - 1)
		Notify(escapeHtml(data.name) + ' <i class="fa fa-user"></i>')
		SelectUserCard(users.length - 1)
	})
*/


/*
	socket.on('new_user', function(data){
		data.historic = GetInscritpion(data.id)
		users.push(data)
		AddUserCard(users.length - 1)
		AddUsersCardsEvents()
		ChargeUserHistoric(users.length - 1)
		Notify(escapeHtml(data.name) + ' <i class="fa fa-user"></i>')
	})
*/


/*
	socket.on('modify_user_ok', function(){
		CloseFormNewUser()	
	})
*/


/*
	socket.on('modify_user', function(data){
		var i = users.map(v => v.id).indexOf(data.id)
		users[i] = data
		MajUserCard(i)
		Notify(escapeHtml(data.name) + 'a été modifé <i class="fa fa-user"></i>')
	})
*/



	function GetInscritpion(id){
		return [{	member_id: id,
					event_time: new Date(), 
					event_type: 'Inscription',
					article_id: 0,
					article_price: 0.00,
					article_name: '',
					fee: 0,
					margin: 0,
					movement: 0,
					movement_bis: 0	}]
	}

	function CloseFormNewUser(){
		modeModifyMember = false
		$('#formNewUser')[0].reset()
		$('#formNewUser').css('display', 'none')
		$('#users').css('display', 'block')
		$('#newUser').addClass('w3-disabled')		
	}

	//Article

	var articles = [],
		modeModifyArticle = false
/*
	socket.emit('load_articles')

	socket.on('load_articles', function(data){

		articles = data
		ChargeArticlesCards()
	})
*/


/*
	socket.on('add_reserved_article', function(data){
		var i = articles.map(v => v.id).indexOf(data)
		$('#articleButtonBuy'+ i).css('display', 'none')
		$('#articleBuyer'+ i).text('Dans un autre panier')

	})
*/


/*
	socket.on('remove_reserved_article', function(data){
		var i = articles.map(v => v.id).indexOf(data)

		$('#articleButtonBuy'+ i).css('display', 'block')
		$('#articleBuyer'+ i).text('Disponible')
	})
*/

	function AddArticleCardEvent(i){

		$('#article'+ i).mouseenter(function(){
		$(this).children('.articleInfoDetail').css('display', 'block')
		$(this).addClass('w3-theme-d3')
		})
		$('#article'+ i).mouseleave(function(){
			$(this).children('.articleInfoDetail').css('display', 'none')
			$(this).removeClass('w3-theme-d3')
		})

		$('#article' + i).dblclick(function(){
			var i = $(this).attr('id').replace('article', '')
			// Controle anuler pour les retours
			//if (articles[i].buyer_id == null) {
				modeModifyArticle = true
				newArticle = articles[i]
				var userIndex = users.map(v => v.id).indexOf(articles[i].provider_id)
				SelectUserCard(userIndex)
				$('#users').prepend($('#userInfo' + userIndex))
				$('#designation').val(newArticle.name.substring(newArticle.name.indexOf('] ') + 2))
				$('#price').val(newArticle.price)
				openFormNewArticle()
			//}
		})

		$('#articleProvider'+ i).mouseenter(function(){$(this).removeClass('w3-opacity')})
		$('#articleProvider'+ i).mouseleave(function(){$(this).addClass('w3-opacity')})
 		$('#articleProvider'+ i).click(function(){
 			var i = $(this).attr('id').replace('articleProvider', '')
 			userIndex = users.map(v => v.id).indexOf(articles[i].provider_id)
 			SelectUserCard(userIndex)
			$('#users').prepend($('#userInfo' + userIndex))
 		})

		if (articles[i].buyer_name != null) {
	 		$('#articleBuyer'+ i).mouseenter(function(){$(this).removeClass('w3-opacity')})
			$('#articleBuyer'+ i).mouseleave(function(){$(this).addClass('w3-opacity')})		
	  		$('#articleBuyer'+ i).click(function(){
	 			var i = $(this).attr('id').replace('articleBuyer', ''),
	 			userIndex = users.map(v => v.id).indexOf(articles[i].buyer_id)
	 			SelectUserCard(userIndex)
	 			$('#users').prepend($('#userInfo' + userIndex))
	 		})
  		}else{
  			$('#articleBuyer'+ i).on('mouseleave mouseenter click', function(){})
  		}
		
		/*		
		$('#articleButtonBuy'+ i).click(function(){
			var i = $(this).attr('id').replace("articleButtonBuy", '')
			socket.emit('add_reserved_article', articles[i].id)
		})
		*/

	}

	function AddArticleCard(i){
		searchArrayArticle.push({
			label: '',
			index: i,
			ok: true
		})
		$('#articles').prepend('<div id="article'+ i +'" class="articleInfo w3-card w3-padding w3-theme-d2 w3-round" style="display: none;"></div>')
		MajArticleCard(i)
		if (articles[i].provider_id == member.id) {
			$('#article' + i).css('display', 'block')
			searchArrayArticle.filter(v => v.index == i)[0].ok = true
		}
		if (articles[i].buyer_name == null) {$('#articleButtonBuy' + i).css('display', 'block')}
	}

	function MajArticleCard(i){
		searchArrayArticle.filter(v => v.index == i)[0].label = articles[i].name.toLowerCase()
		var divBuyer = ''
		if (articles[i].buyer_name != null) {
			divBuyer = '<span id="articleBuyer'+ i +'" data-buyer-id="'+ articles[i].buyer_id +'" class="articleBuyer w3-opacity" style="cursor: pointer">'
				  	 + 'Vendu à ' + escapeHtml(articles[i].buyer_name) + ' le ' + new Date(articles[i].sale_time).toLocaleString() + '</span>'
		}else{
			divBuyer = '<span id="articleBuyer'+ i +'" class="w3-opacity">Disponible</span>'
		}
		$('#article' + i).html( 
				'<div class="w3-row w3-large">'
			+		'<div class="w3-col w3-threequarter">'+ escapeHtml(articles[i].name) +'</div>'
			+		'<span class="w3-col w3-quarter w3-right-align"><i>'+ articles[i].price.toFixed(2) +'</i></span>'
			//+		articles[i].id
			+	'</div>'

			+	'<div id="articleInfoDetail'+ i +'" class="articleInfoDetail w3-row w3-small" style="display: none;">'
			+		'<div class="w3-col w3-threequarter">'
			+			'<div class="w3-small">'
			+				divBuyer + '<br>'		
			+				'<span id="articleProvider'+ i +'" class="articleProvider w3-opacity" style="cursor: pointer">'
			+				'Fourni par ' + escapeHtml(articles[i].provider_name) + ' le ' + new Date(articles[i].create_time).toLocaleString() + '</span>'		
			+			'</div>'					
			+		'</div>'

			+		'<div id="articleButtonBuy'+ i +'" class="articleButtonBuy w3-col w3-quarter w3-button w3-round" style="display: none;">'
			+			'<i class="w3-large fa fa-cart-arrow-down"></i>'
			+		'</div>'
			+	'</div>'
		)
		if (articles[i].buyer_name == null) {$('#articleButtonBuy' + i).css('display', 'block')}
	}

	function ChargeArticlesCards(){
		$('#articles').text('')
		var length = articles.length
		for (var i = 0; i < length; i++) {
			AddArticleCard(i)
			AddArticleCardEvent(i)
		}
	}

	$('#openFormNewArticle').mouseenter(function(){$(this).prepend('<i class="fa fa-plus"></i>')})
	$('#openFormNewArticle').mouseleave(function(){$(this).children('.fa-plus').remove()})

	$('#openFormNewArticle').click(function(){
		openFormNewArticle()
	})

	function openFormNewArticle(){
		$('#articles').css('display', 'none')
		$('#formNewArticle').css('display', 'block')
		$('#newArticle').css('display', 'block')
		window.setTimeout(function(){$('#designation').focus()}, 100)		
	}

	$('#closeFormNewArticle').click(function(){
		CloseFormNewArticle()
	})

	var newArticle = {},
		newArticleOk = false

	$('.articleInput').on('keyup click',function(){TestFormArticle()})

	function TestFormArticle(){
		
		var fee = 0, price = parseFloat($('#price').val())
		if (price > 5) {
			fee = 1
		}else if(price > 0){
			fee = 0.5
		}else{
			fee = 0
		}

		$('#feeInfo').text('Frais: ' + fee.toFixed(2))

		newArticle = {
			'id': 			newArticle.id, //N'en a un qu'en mode modification
			'buyer': 		newArticle.buyer_id, //N'en a un qu'en mode modification
			'provider': 	member.id,
			'name': 		$('#designation').val(),
			'price': 		price,
			'fee': 			fee,
			'margin': 		parseFloat($('#price').val()) * 0.1
		}

		newArticleOk = true
		if (price < 0) {newArticleOk = false}
		if (newArticle.provider == undefined) {newArticleOk = false}
		if (newArticle.name.length < 4) {newArticleOk = false}
		if (isNaN(parseFloat(newArticle.price))) {newArticleOk = false}
		if (newArticle.price > 10000000) {newArticleOk = false}
		if (newArticleOk) {	$('#newArticle').removeClass('w3-disabled')}
		else{$('#newArticle').addClass('w3-disabled')}	
	}

	$('#price').keyup(function(){
		if (event.which == 13) {SendFormArticle()} 
	})

	$('#newArticle').click(function(){
		SendFormArticle()
	})

/*
	function SendFormArticle(){
		if (newArticleOk) {
			if (modeModifyArticle) {
				socket.emit('modify_article', newArticle)
			}else{
				socket.emit('new_article', newArticle)
			}
			$('#newArticle').css('display', 'none')
		}
	}

*/


/*	socket.on('new_article_ok', function(){
		CloseFormNewArticle()	
	})
*/


/*
	socket.on('new_article', function(data){
		articles.push(data)
		AddArticleCard(articles.length - 1)
		AddArticleCardEvent(articles.length - 1)
		Notify(escapeHtml(data.name.substring(0, 125)) + ' <i class="fa fa-cube"></i>')
	})
*/


/*
	socket.on('modify_article_ok', function(){
		CloseFormNewArticle()	
	})
*/


/*
	socket.on('modify_article', function(data){
		var i = articles.map(v => v.id).indexOf(data.id)
		articles[i] = data
		MajArticleCard(i)
		AddArticleCardEvent(i)
		Notify(escapeHtml(data.name.substring(0, 125)) + ' <i class="fa fa-cube"></i>')
	})
*/

	function CloseFormNewArticle(){
		modeModifyArticle = false
		$('#formNewArticle')[0].reset()
		$('#feeInfo').text('Frais: 0.00')
		$('#formNewArticle').css('display', 'none')
		$('#articles').css('display', 'block')	
	}


	//Sale
/*
	$('#closeFormNewSale').click(function(){
		for (var i = cart.length - 1; i >= 0; i--) {
			socket.emit('remove_reserved_article', cart[i].id)
		}
	})
*/

/*
	$('#newSale').click(function(){
		if (cart.length > 0 && member.id != undefined) {
			var newSale = {}
			newSale.buyer = member.id			
			newSale.cart = cart.map(v => v.id)
			socket.emit('new_sale', newSale)
			$('#newSale').css('display', 'none')
		}
	})
*/


/*
	socket.on('new_sale_ok', function(){
		cart = []
		CloseCart()
	})
	socket.on('new_sale', function(data){

		var totalPrice = data.map(v => v.price).reduce((acc, cur) => acc += cur)
		Notify(totalPrice + ' <i class="fa fa-shopping-cart"></i>')	
			
		var indexs = data.map(data => articles.map(art => art.id).indexOf(data.id))

		for (var i = data.length - 1; i >= 0; i--) {
			articles[indexs[i]] = data[i]
			$('#articleBuyer'+ indexs[i]).text('Vendu à ' + escapeHtml(articles[indexs[i]].buyer_name) + ' le ' + new Date(articles[indexs[i]].sale_time).toLocaleString())
			$('#articleBuyer'+ indexs[i]).addClass('articleBuyer')
			$('#articleBuyer'+ indexs[i]).css('cursor', 'pointer')
			AddArticleCardEvent(indexs[i])
		}
	})
*/


/*
	socket.on('add_reserved_article_ok', function(data){
		var i = articles.map(v => v.id).indexOf(data)
		cart.push(articles[i])
		cart[cart.length - 1].articleIndex = i
		$('#articleButtonBuy'+ i).css('display', 'none')
		$('#articleBuyer'+ i).text('Dans votre panier')
		ChargeCart()
		OpenCart()

		Notify('Un article a été ajouté au panier !')
	})
*/


/*
	socket.on('remove_reserved_article_ok', function(data){

		var i = cart.map(v => v.id).indexOf(data)
		$('#articleButtonBuy'+ cart[i].articleIndex).css('display', 'block')
		$('#articleBuyer'+ cart[i].articleIndex).text('Disponible')
		cart.splice(i, 1)
		ChargeCart()
		if (cart.length == 0) {CloseCart()}
		
		Notify('Un article a été retiré du panier !')
	})
*/

	function OpenCart(){
		$('#newSale').css('display', 'block')

		TestCart()

		if ($('#saleColumn').css('display') != 'block') {
			$('#saleColumn').css('display', 'block')
			$('#userColumn').removeClass('w3-half')
			$('#userColumn').addClass('w3-third')
			$('#articleColumn').removeClass('w3-half')
			$('#articleColumn').addClass('w3-third')
		}
		$('.articleOnCart').mouseenter(function(){$(this).children('.fa-trash').css('display', 'inline')})
		$('.articleOnCart').mouseleave(function(){$(this).children('.fa-trash').css('display', 'none')})
		
		$('.removeArticleOnCart').click(function(){
			var i = $(this).attr('id').replace('removeArticleOnCart', '')
			$('#article' + cart[i].articleIndex).css('display', 'block')

			//socket.emit('remove_reserved_article', cart[i].id)

		})
	}

	function TestCart(){
		if (cart.length == 0 || member.name == undefined) {
			$('#newSale').addClass('w3-disabled')
		}else{
			$('#newSale').removeClass('w3-disabled')
		}
	}

	function ChargeCart(){
		var total = 0
		var length = cart.length

		$('#cart').html('')
		for (var i = 0; i < length; i++) {
			$('#cart').append('<div id="articleOnCart'+ i +'" class="articleOnCart w3-row w3-border-bottom">'
							+	'<i id="removeArticleOnCart'+ i +'" class="removeArticleOnCart fa fa-trash" style="display: none; cursor: pointer;"> </i>' 
							+ 	escapeHtml(cart[i].name) 
							+	'<i class="w3-right">' + cart[i].price + '</i></div>')
			total += cart[i].price
		}
		$('#cart').append('<div id="totalPrice" class="w3-row w3-right"><b><i>' + total + '</i></b></div>')
	}

	function CloseCart(){
		$('#saleColumn').css('display', 'none')
		$('#userColumn').removeClass('w3-third')
		$('#userColumn').addClass('w3-half')
		$('#articleColumn').removeClass('w3-third')
		$('#articleColumn').addClass('w3-half')
	}

	function escapeHtml(text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		}
		return text.replace(/[&<>"']/g, function(m) { return map[m]; })
	}


	//Recherhe
	var val = '',
		filtreSup = false,
		searchArrayUser = [],
		searchArrayArticle = []
	/*
	$('#searchInput').keyup(function(){

		val.length < $(this).val().length ? filtreSup = true : filtreSup = false
		val = $(this).val().toLowerCase()
		if (val == 'allnegativebalance'){
			users.forEach((v, i) => v.balanceReal<0 ? $('#userInfo' + i).css('display', 'block') : $('#userInfo' + i).css('display', 'none'))
		}else if (val == 'allnullbalance'){
			users.forEach((v, i) => v.balanceReal==0 ? $('#userInfo' + i).css('display', 'block') : $('#userInfo' + i).css('display', 'none'))
		}else if (val == 'allpositivebalance'){
			users.forEach((v, i) => v.balanceReal>0 ? $('#userInfo' + i).css('display', 'block') : $('#userInfo' + i).css('display', 'none'))
		}else{
			Search()
		}

	})
	*/
	
	var onlyAvailableArticle = false
	$('#onlyAvailableArticle').click(function(){
		onlyAvailableArticle = $(this).is(':checked')
		onlyAvailableArticle ? filtreSup = true : filtreSup = false
		Search()
	})

	var usersVisible = [],
		articlesVisible = []

	function Search() {
		
		var chrono = new Date()

		console.log(val, onlyAvailableArticle)
		//filtre
		if (filtreSup) {
			searchArrayUser.filter(v => v.ok && v.label.indexOf(val) == -1 ).forEach(v => v.ok = false)
			searchArrayArticle.filter(v => v.ok && v.label.indexOf(val) == -1).forEach(v => v.ok = false)
			onlyAvailableArticle && searchArrayArticle.filter(v => v.ok && articles[v.index].buyer_id != null).forEach(v => v.ok = false)
		}else{
			searchArrayUser.filter(v => !v.ok && v.label.indexOf(val) != -1).forEach(v => v.ok = true)
			if (onlyAvailableArticle) {
				searchArrayArticle.filter(v => !v.ok && v.label.indexOf(val) != -1 && articles[v.index] == null).forEach(v => v.ok = true)
			}else{
				searchArrayArticle.filter(v => !v.ok && v.label.indexOf(val) != -1).forEach(v => v.ok = true)
			}
		}

		//affichage
		console.log(eval(usersVisible))
		console.log(eval(articlesVisible))
		usersVisible.forEach(v => $('#userInfo' + v).css('display', 'none'))
		articlesVisible.forEach(v => $('#article' + v).css('display', 'none'))
		usersVisible = []
		articlesVisible = []

		var usersOK = searchArrayUser.filter(v => v.ok),
			articlesOK = searchArrayArticle.filter(v => v.ok)

		member.userIndex != undefined ? usersVisible = usersOK.splice(0, 9).map(v => v.index) : usersVisible = usersOK.splice(0, 10).map(v => v.index)
		console.log(usersVisible)
		usersVisible.forEach(v => $('#userInfo' + v).css('display', 'block'))

		usersOK.length > 0 ? $('#showAllUsers').text(usersOK.length  + 10 + ' membres trouvés') : $('#showAllUsers').text('')

		if(member.userIndex != undefined){
			$('#userInfo' + member.userIndex).css('display', 'block')
			$('#users').prepend($('#userInfo' + member.userIndex))
			//searchArrayUser.filter(v => v.index == member.userIndex)[0].ok = true
			usersVisible.push(member.userIndex)
		}

		articlesVisible = articlesOK.splice(0, 10).map(v => v.index)
		articlesVisible.forEach(v => $('#article' + v).css('display', 'block'))

		articlesOK.length > 0 ? $('#showAllArticles').text(articlesOK.length  + 10 + ' articles trouvés') : $('#showAllArticles').text('')

		console.log('Durée de la recherche', new Date() - chrono + ' ms')
		chrono = new Date()
	}

	$('#showAllUsers').mouseleave(function(){$(this).addClass('w3-opacity')})
	$('#showAllUsers').mouseenter(function(){$(this).removeClass('w3-opacity')})
	$('#showAllUsers').click(function(){
		usersVisible = []
		searchArrayUser.filter(v => v.ok).forEach(function(v){
			$('#userInfo' + v.index).css('display', 'block')
			usersVisible.push(v.index)
		})
		$(this).text('')
	})
	$('#showAllArticles').mouseleave(function(){$(this).addClass('w3-opacity')})
	$('#showAllArticles').mouseenter(function(){$(this).removeClass('w3-opacity')})
	$('#showAllArticles').click(function(){
		articlesVisible = []
		searchArrayArticle.filter(v => v.ok).forEach(function(v){
			$('#article' + v.index).css('display', 'block')
			articlesVisible.push(v.index)
		})
		$(this).text('')
	})
})