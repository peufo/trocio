$(function(){

	$('#infoSup').delay(1000).fadeIn(200)

	$('.onglet').click(function(){
		$('.onglet').removeClass('ongletSelect')
		$(this).addClass('ongletSelect')
		$('.infoContent').css('display', 'none')
		$('#' + $(this).data('contentid')).css('display', 'block')
	})

	var possibility = ['Administrez', 'Participez à', 'Travaillez pour']
	function Change(i){	
		if(i == possibility.length){i = 0}	
		$('#possibility').fadeOut('slow', function(){
			$('#possibility').html(possibility[i++]).fadeIn('slow')
		})
		setTimeout(function(){Change(i)}, 3000)
	}
	setTimeout(function(){Change(1)}, 3000)


	$('.functionalities li').hover(
		function(){
			$('#vueCashier').css('display', 'none')
			$('#functionality' + $(this).data('functionality')).css('display', 'block')
		},
		function(){
			$('#functionality' + $(this).data('functionality')).css('display', 'none')
			$('#vueCashier').css('display', 'block')
		}
	)


	$('#openFormNewUser').click(() => {
		$('#punchLine').css('display', 'none')
		$('#openFormNewUser').css('display', 'none')
		$('#openFormLogin').css('display', 'none')
		$('#formNewUser').css('display', 'block')
	})

	$('#closeFormNewUser').click(() => {
		$('#punchLine').css('display', 'block')
		$('#openFormNewUser').css('display', 'block')
		$('#openFormLogin').css('display', 'block')
		$('#formNewUser').css('display', 'none')
	})

	$('#openFormLogin').click(() => {
		$('#punchLine').css('display', 'none')
		$('#openFormLogin').css('display', 'none')
		$('#openFormNewUser').css('display', 'none')
		$('#formLogin').css('display', 'block')
	})

	$('#closeFormLogin').click(() => {
		$('#punchLine').css('display', 'block')
		$('#openFormLogin').css('display', 'block')
		$('#openFormNewUser').css('display', 'block')
		$('#formLogin').css('display', 'none')
	})


	var msgFNU = ''
	$('#formNewUser').keyup((e) => {

		msgFNU = ''
		if ($('#userNameInput').val().length < 3) msgFNU = 'Votre nom est trop court !'
		/*
		var birth = new Date($('#userBirthdayInput').val())
		var age = new Date().getFullYear() - birth.getFullYear()	
		if (msgFNU == '' && birth == 'Invalid Date') msgFNU = 'Date d\'anniversaire !'
		if (msgFNU == '' && birth > new Date()) msgFNU = 'Vous venez du futur?'
		if (msgFNU == '' && birth < new Date('1900-01-01')) msgFNU = 'Vous avez ' + age + ' ans ?'
		*/
		if (msgFNU == '' && ($('#userMailInput').val().indexOf('@') < 0 || $('#userMailInput').val().length < 5)) msgFNU = 'Email invalide !'
		
		//if (msgFNU == '' && $('#userPhoneInput').val().length < 6) msgFNU = 'Téléphone invalide !'
		
		if (msgFNU == '' && $('#userNewPassword').val().length < 6) msgFNU = 'Mot de passe trop court !'

		if (msgFNU == '' && $('#userNewPassword').val() != $('#userNewPassword2').val())  msgFNU = 'Mot de passe différent !'

		if (msgFNU == '') {
			$('#newUser').removeClass('w3-disabled')
		}else{
			$('#newUser').addClass('w3-disabled')
		}

		if (e.keyCode == 13) {
			if (msgFNU == '') {
				CreateNewUser()
			}else{
				console.log('Echec: ' + msgFNU)
			}
		}
	})

	var msgLOG = ''
	$('#formLogin').keyup((e) => {
		msgLOG = ''

		if (msgLOG == '' && ($('#userMailLogin').val().indexOf('@') < 0 || $('#userMailLogin').val().length < 5)) msgLOG = 'Email invalide !'

		if (msgLOG == '' && $('#password').val().length < 6) msgLOG = 'Mot de passe trop court !'

		if (msgLOG == '') {
			$('#login').removeClass('w3-disabled')
		}else{
			$('#login').addClass('w3-disabled')
		}

		if (e.keyCode == 13) {
			if (msgLOG == '') {
				Login({
					mail: $('#userMailLogin').val(),
					password: $('#password').val()
				})
			}else{
				console.log('Echec: ' + msgLOG)
			}
		}
	})


	$('#newUser').hover(() => {
		if (msgFNU != '') {$('#newUser').html('<span class="w3-large">' + msgFNU + '</span>')}
	}, () => {
		$('#newUser').html('<i class="w3-xlarge fa fa-check"></i>')
	})

	$('#login').hover(function() {
		if (msgLOG != '') {$('#login').html('<span class="w3-large">' + msgLOG + '</span>')}
	}, function() {
		$('#login').html('<i class="w3-xlarge fa fa-check"></i>')
	})

	$('#newUser').click(() => CreateNewUser())
	$('#login').click(() => Login({
					mail: $('#userMailLogin').val(),
					password: $('#password').val()
	}))	


	function CreateNewUser(){
		var newUser = {
				name: 		$('#userNameInput').val(),
				//birth: 		new Date($('#userBirthdayInput').val()),
				//phone: 		$('#userPhoneInput').val(),
				mail: 		$('#userMailInput').val(),
				password: 	$('#userNewPassword').val()
			}
		$.post('/users', newUser, function(data, status){
			if (data.success) {
				Login({
					mail: newUser.mail, 
					password: newUser.password
				})
			}else{
				alert(data.message)
			}
		})
	}

	function Login(user){
		$.post('/users/login', user, function(data, status){
			if (data.success) {
				document.location = window.location.origin
			}else{
				alert(data.message)
			}
		})
	}
})