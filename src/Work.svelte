<script>
	
</script>


<div class="w3-padding">
	<div class="w3-quarter">&nbsp;</div>
	<input id="searchInput" class="w3-half w3-input w3-round w3-theme-d5" type="text" style="height: 36px; font-size: 1.1em; border: none;" placeholder="Rechercher...">
	<div class="w3-quarter w3-center">
		<label for="onlyAvailableArticle" style="padding-bottom: 10px">Cacher les articles vendus</label>				
		<input id="onlyAvailableArticle" class="w3-check w3-round" type="checkbox">	
	</div>
</div>

<div class="w3-row">

	<!-- Users -->

	<div id="userColumn" class="w3-half" style="height: 100%">
		<div id="openFormNewUser" class="w3-xlarge w3-row w3-center" style="cursor: pointer;">
			<i class="fa fa-user"></i> Membres
		</div>

		<div class="w3-row-padding">
			<form id="formNewUser" action="#" class="w3-card w3-padding w3-margin-bottom w3-theme-d2 w3-animate-bottom" style="display: none">

				<div class="w3-row w3-center">
					<div class="w3-col" style="width: 50px"><i class="w3-xxlarge fa fa-user"></i></div>
					<div class=" w3-rest">
						<input id="userNameInput" class="userInput w3-input w3-round" type="text" placeholder="Nom & prénom"></div>
				</div>
				
				<div class="w3-row w3-margin-top w3-center">
					<div class="w3-col" style="width:50px"><i class="w3-xxlarge fa fa-envelope"></i></div>
					<div  class="w3-rest"><input id="userMailInput" class="userInput w3-input w3-round" type="mail" placeholder="Email"></div>
				</div>

				<div class="w3-row w3-margin-top w3-center">
					<div class="w3-col" style="width:50px"><i class="w3-xxlarge fa fa-phone"></i></div>
					<div  class="w3-rest"><input id="userPhoneInput" class="userInput w3-input w3-round" type="tel" placeholder="Telephone"></div>
				</div>

				<div class="w3-row w3-margin-top w3-center">
					<div class="w3-col" style="width:50px"><i class="w3-xxlarge fa fa-birthday-cake"></i></div>
					<div  class="w3-rest"><input id="userBirthdayInput" class="userInput w3-input w3-round" type="date" min="1900-01-01"></div>
				</div>

				<div class="w3-row w3-margin-top w3-center">
					<div id="closeFormNewUser" class="w3-half w3-button w3-round w3-red"><i class="w3-xlarge fa fa-times"></i></div>
					<div id="newUser" class="w3-half w3-button w3-round w3-green w3-disabled"><i class="w3-xlarge fa fa-check"></i></div>
				</div>

			</form>
		</div>

		<div id="users" class="w3-row-padding w3-margin-bottom" style="overflow: scroll;max-height: 800px"></div>

		<div id="showAllUsers" class="w3-center w3-opacity" style="cursor: pointer;"></div>
	</div>



	<!-- Article -->

	<div id="articleColumn" class="w3-half">

		<div id="openFormNewArticle" class="w3-xlarge w3-row w3-center" style="cursor: pointer;">
			<i class="fa fa-cube"></i> Articles
		</div>

		<div class="w3-row-padding">

			<form id="formNewArticle" action="javascript:void(0)" class="w3-card w3-padding w3-margin-bottom w3-theme-d2 w3-animate-bottom" style="display: none">

				<div class="w3-row w3-margin-top">
					<div class="w3-col w3-center" style="width:50px"><i class="w3-xxlarge fa fa-user"></i></div>
					<div class="w3-rest"><span id="provider" class="w3-xlarge"></span>
					</div>
				</div>

				<div class="w3-row w3-margin-top">
					<div class="w3-col w3-center" style="width:50px"><i class="w3-xxlarge fa fa-cube"></i></div>
					<div class="w3-rest"><textarea id="designation" name="designation" rows="3" placeholder="Déignation"class="articleInput w3-input w3-round" style="resize: none;"></textarea>
					</div>
				</div>
				
				<div class="w3-row w3-margin-top">
					<div class="w3-col w3-center" style="width:50px"><i class="w3-xxlarge fa fa-euro-sign"></i></div>
					<div class="w3-rest"><input id="price" name="price" class="articleInput w3-input w3-round" type="number" placeholder="Prix" min="0"></div>
				</div>
				<div class="w3-row w3-small">
					<div id="feeInfo" class="w3-col w3-center w3-half">Frais: 0.00</div>
					<div id="marginInfo" class="w3-col w3-center w3-half">marge: 10%</div>
				</div>

				<div class="w3-row w3-margin-top">
					<div id="closeFormNewArticle" class="w3-half w3-button w3-round w3-red"><i class="w3-xlarge fa fa-times"></i></div>
					<div id="newArticle" class="w3-half w3-button w3-round w3-green w3-disabled">
						<i class="w3-xlarge fa fa-check"></i>
					</div>
				</div>

			</form>
		</div>

		<div id="articles" class="w3-row-padding w3-margin-bottom" style="overflow: scroll;max-height:800px"></div>

		<div id="showAllArticles" class="w3-center w3-opacity" style="cursor: pointer;"></div>

	</div>


	<!-- Sale -->

	<div id="saleColumn" class="w3-third" style="display: none">

		<div class="w3-xlarge w3-row w3-center">
		    <i class="fa fa-shopping-cart"></i> Vente
		</div>

		<div class="w3-row-padding">
			<form id="formNewSale" action="#" class="w3-card w3-padding w3-margin-bottom w3-theme-d2 w3-animate-bottom" >

				<div class="w3-row w3-margin-top">
					<div class="w3-col w3-center" style="width:50px"><i class="w3-xxlarge fa fa-user"></i></div>
					<div class="w3-rest"><span id="buyer" class="w3-xlarge"></span>
					</div>
				</div>

				<div class="w3-row w3-margin-top">
					<div class="w3-col w3-center" style="width:50px"><i class="w3-xxlarge fa fa-shopping-cart"></i></div>
					<div id="cart" class="w3-rest w3-large"></div>
				</div>

				<div class="w3-row w3-margin-top">
					<div id="closeFormNewSale" class="w3-half w3-button w3-round w3-red"><i class="w3-xlarge fa fa-times"></i></div>
					<div id="newSale" class="w3-half w3-button w3-round w3-green w3-disabled"><i class="w3-xlarge fa fa-check"></i></div>
				</div>
			</form>
		</div>
	</div>
</div>